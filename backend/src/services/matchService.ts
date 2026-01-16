import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function scheduleRoundRobin(startDate?: string, includeFriendlies: boolean = false) {
  const teams = await prisma.team.findMany({ orderBy: { id: 'asc' } })
  if (teams.length < 2) throw new Error('Not enough teams to schedule matches')

  // Group teams by country (league region). Only schedule league matches within the same country.
  const groups = teams.reduce((acc: Record<string, any[]>, team) => {
    const key = team.country || 'unknown'
    ;(acc[key] ||= []).push(team)
    return acc
  }, {} as Record<string, any[]>)

  const matches: any[] = []
  let nextDate = startDate ? new Date(startDate) : null

  // For each country group, schedule a double round-robin (home + away)
  for (const country of Object.keys(groups)) {
    const group = groups[country]
    if (group.length < 2) continue

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        // create two matches: team A home vs team B, and team B home vs team A
        const aHome = await prisma.match.create({
          data: {
            homeTeamId: group[i].id,
            awayTeamId: group[j].id,
            playedAt: nextDate ?? null,
            type: 'league',
          },
        })
        matches.push(aHome)
        if (nextDate) nextDate = new Date(nextDate.getTime() + 24 * 60 * 60 * 1000)

        const bHome = await prisma.match.create({
          data: {
            homeTeamId: group[j].id,
            awayTeamId: group[i].id,
            playedAt: nextDate ?? null,
            type: 'league',
          },
        })
        matches.push(bHome)
        if (nextDate) nextDate = new Date(nextDate.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  }

  // Optionally create friendlies between countries
  if (includeFriendlies) {
    const countries = Object.keys(groups)
    for (let a = 0; a < countries.length; a++) {
      for (let b = a + 1; b < countries.length; b++) {
        const gA = groups[countries[a]]
        const gB = groups[countries[b]]
        // create friendlies: each team in A plays one friendly against each team in B (A home)
        for (const teamA of gA) {
          for (const teamB of gB) {
            const f = await prisma.match.create({
              data: {
                homeTeamId: teamA.id,
                awayTeamId: teamB.id,
                playedAt: nextDate ?? null,
                type: 'friendly',
              },
            })
            matches.push(f)
            if (nextDate) nextDate = new Date(nextDate.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }
    }
  }

  return matches
}

export async function getAllMatches() {
  const matches = await prisma.match.findMany({ orderBy: { createdAt: 'asc' } })
  const teamIds = Array.from(new Set(matches.flatMap(m => [m.homeTeamId, m.awayTeamId])))
  const teams = await prisma.team.findMany({ where: { id: { in: teamIds } }, include: { roster: { include: { player: true } } } })
  const teamMap = new Map<number, any>()
  teams.forEach(t => teamMap.set(t.id, t))
  return matches.map(m => ({ ...m, homeTeam: teamMap.get(m.homeTeamId) ?? null, awayTeam: teamMap.get(m.awayTeamId) ?? null }))
}

function computeTeamStrength(team: any) {
  if (!team || !team.roster || team.roster.length === 0) return 50
  const overalls = team.roster.map((r: any) => r.player?.overall ?? 50)
  const avg = overalls.reduce((a: number, b: number) => a + b, 0) / overalls.length
  return avg
}

export async function simulateMatch(matchId: number) {
  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) throw new Error('Match not found')
  if (match.status === 'played') throw new Error('Match has already been played')

  const home = await prisma.team.findUnique({ where: { id: match.homeTeamId }, include: { roster: { include: { player: true } } } })
  const away = await prisma.team.findUnique({ where: { id: match.awayTeamId }, include: { roster: { include: { player: true } } } })

  const homeStr = computeTeamStrength(home)
  const awayStr = computeTeamStrength(away)

  const base = 80
  const homeExpected = base + (homeStr - awayStr) * 0.4 + 4
  const awayExpected = base + (awayStr - homeStr) * 0.4

  function sampleScore(expected: number) {
    const variance = 20
    const score = Math.round(expected + (Math.random() - 0.5) * variance)
    return Math.max(50, score)
  }

  const homeScore = sampleScore(homeExpected)
  const awayScore = sampleScore(awayExpected)

  const updated = await prisma.match.update({ where: { id: matchId }, data: { homeScore, awayScore, status: 'played', playedAt: new Date() } })

  if (homeScore > awayScore) {
    await prisma.team.update({ where: { id: match.homeTeamId }, data: { wins: { increment: 1 } } })
    await prisma.team.update({ where: { id: match.awayTeamId }, data: { losses: { increment: 1 } } })
  } else if (awayScore > homeScore) {
    await prisma.team.update({ where: { id: match.awayTeamId }, data: { wins: { increment: 1 } } })
    await prisma.team.update({ where: { id: match.homeTeamId }, data: { losses: { increment: 1 } } })
  }

  return { ...updated, homeTeam: home, awayTeam: away }
}

export async function getMatchById(matchId: number) {
  const m = await prisma.match.findUnique({ where: { id: matchId } })
  if (!m) return null
  const home = await prisma.team.findUnique({ where: { id: m.homeTeamId }, include: { roster: { include: { player: true } } } })
  const away = await prisma.team.findUnique({ where: { id: m.awayTeamId }, include: { roster: { include: { player: true } } } })
  return { ...m, homeTeam: home, awayTeam: away }
}
