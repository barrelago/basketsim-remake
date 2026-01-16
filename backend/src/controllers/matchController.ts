import { Request, Response } from 'express'
import { scheduleRoundRobin, getAllMatches, simulateMatch, getMatchById } from '../services/matchService.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function scheduleMatches(req: Request, res: Response) {
  try {
    const { startDate, includeFriendlies } = req.body

    if (startDate) {
      const d = new Date(startDate)
      if (isNaN(d.getTime())) {
        res.status(400).json({ error: 'Invalid startDate; expected ISO date string' })
        return
      }
    }

    const include = Boolean(includeFriendlies)
    const matches = await scheduleRoundRobin(startDate, include)
    res.json(matches)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export async function listMatches(req: Request, res: Response) {
  try {
    // Parse pagination and filters
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 10))
    const status = typeof req.query.status === 'string' && req.query.status !== 'all' ? req.query.status : undefined
    const type = typeof req.query.type === 'string' && req.query.type !== 'all' ? req.query.type : undefined
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined
    const country = typeof req.query.country === 'string' && req.query.country !== 'all' ? req.query.country : undefined

    // Build where clause depending on admin or user
    let baseWhere: any = {}
    if (status) baseWhere.status = status
    if (type) baseWhere.type = type
    if (startDate) {
      const d = new Date(startDate)
      if (isNaN(d.getTime())) {
        res.status(400).json({ error: 'Invalid startDate; expected ISO date string' })
        return
      }
      baseWhere.playedAt = { gte: d }
    }
    if (country) {
      const teamsInCountry = await prisma.team.findMany({
        where: { country },
        select: { id: true },
      })
      const teamIds = teamsInCountry.map((t) => t.id)
      if (teamIds.length === 0) {
        res.json({ data: [], total: 0, page, pageSize })
        return
      }
      baseWhere.OR = [
        { homeTeamId: { in: teamIds } },
        { awayTeamId: { in: teamIds } },
      ]
    }

    if (req.user && req.user.role === 'admin') {
      // Admin: return paginated all matches
      const total = await prisma.match.count({ where: baseWhere })
      const matches = await prisma.match.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })

      const teamIdsUsed = Array.from(new Set(matches.flatMap((m: any) => [m.homeTeamId, m.awayTeamId])))
      const teamsFull = await prisma.team.findMany({ where: { id: { in: teamIdsUsed } }, include: { roster: { include: { player: true } } } })
      const teamMap = new Map<number, any>()
      teamsFull.forEach(t => teamMap.set(t.id, t))

      const mapped = matches.map((m: any) => ({ ...m, homeTeam: teamMap.get(m.homeTeamId) ?? null, awayTeam: teamMap.get(m.awayTeamId) ?? null }))
      res.json({ data: mapped, total, page, pageSize })
      return
    }

    // For authenticated non-admin users, return matches involving their team(s)
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const userId = req.user.id
    // find teams owned by this user
    const teamsOwned = await prisma.team.findMany({ where: { userId } })
    const teamIds = teamsOwned.map((t) => t.id)

    if (teamIds.length === 0) {
      res.json({ data: [], total: 0, page, pageSize })
      return
    }

    const where = {
      AND: [
        baseWhere,
        {
          OR: [
            { homeTeamId: { in: teamIds } },
            { awayTeamId: { in: teamIds } },
          ],
        },
      ],
    }

    const total = await prisma.match.count({ where })
    const matches = await prisma.match.findMany({ where, orderBy: { createdAt: 'asc' }, skip: (page - 1) * pageSize, take: pageSize })

    const teamIdsUsed = Array.from(new Set(matches.flatMap((m: any) => [m.homeTeamId, m.awayTeamId])))
    const teamsFull = await prisma.team.findMany({ where: { id: { in: teamIdsUsed } }, include: { roster: { include: { player: true } } } })
    const teamMap = new Map<number, any>()
    teamsFull.forEach(t => teamMap.set(t.id, t))

    const mapped = matches.map((m: any) => ({ ...m, homeTeam: teamMap.get(m.homeTeamId) ?? null, awayTeam: teamMap.get(m.awayTeamId) ?? null }))
    res.json({ data: mapped, total, page, pageSize })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function getMatch(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const m = await getMatchById(id)
    if (!m) return res.status(404).json({ error: 'Match not found' })
    res.json(m)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function handleSimulate(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const result = await simulateMatch(id)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export async function rescheduleMatches(req: Request, res: Response) {
  try {
    const { startDate, includeFriendlies } = req.body

    // Remove existing matches
    await prisma.match.deleteMany({})

    // Schedule new matches
    const matches = await scheduleRoundRobin(startDate, Boolean(includeFriendlies))
    res.json({ created: matches.length, matches })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
