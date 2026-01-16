import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const usersCount = await prisma.user.count()
  const teamsCount = await prisma.team.count()
  const matchesCount = await prisma.match.count()

  const users = await prisma.user.findMany({ take: 10, orderBy: { id: 'asc' } })
  const teams = await prisma.team.findMany({ take: 10, orderBy: { id: 'asc' }, include: { roster: { include: { player: true } } } })
  const matches = await prisma.match.findMany({ take: 20, orderBy: { createdAt: 'asc' } })

  const teamIds = Array.from(new Set(matches.flatMap(m => [m.homeTeamId, m.awayTeamId])))
  const relatedTeams = await prisma.team.findMany({ where: { id: { in: teamIds } }, include: { roster: { include: { player: true } } } })
  const teamMap = new Map<number, any>()
  relatedTeams.forEach(t => teamMap.set(t.id, t))

  const mappedMatches = matches.map(m => ({ ...m, homeTeam: teamMap.get(m.homeTeamId) ?? null, awayTeam: teamMap.get(m.awayTeamId) ?? null }))

  const out = {
    counts: { users: usersCount, teams: teamsCount, matches: matchesCount },
    users,
    teams,
    matches: mappedMatches,
  }

  console.log(JSON.stringify(out, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
