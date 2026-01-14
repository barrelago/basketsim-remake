import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAvailablePlayers(req: Request, res: Response): Promise<void> {
  try {
    const players = await prisma.player.findMany({
      where: { status: 'available' },
      orderBy: { overall: 'desc' },
    })
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' })
  }
}

export async function getPlayer(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const player = await prisma.player.findUnique({
      where: { id: parseInt(id) },
    })
    if (!player) {
      res.status(404).json({ error: 'Player not found' })
      return
    }
    res.json(player)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player' })
  }
}

export async function draftPlayerHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const { playerId, position, number } = req.body

    if (!playerId || !position || !number) {
      res.status(400).json({ error: 'Missing required fields: playerId, position, number' })
      return
    }

    // Get user's team
    const team = await prisma.team.findUnique({
      where: { userId: req.user.id },
    })

    if (!team) {
      res.status(404).json({ error: 'Team not found. Please create a team first.' })
      return
    }

    // Get player
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    })

    if (!player) {
      res.status(404).json({ error: 'Player not found' })
      return
    }

    if (player.status !== 'available') {
      res.status(400).json({ error: 'Player is not available for draft' })
      return
    }

    // Check budget
    if (team.budget < player.salary) {
      res.status(400).json({ error: `Insufficient budget. Need $${player.salary}K, have $${team.budget}K` })
      return
    }

    // Draft the player
    const roster = await prisma.teamRoster.create({
      data: {
        teamId: team.id,
        playerId,
        position,
        number,
      },
      include: {
        player: true,
      },
    })

    // Update player status
    await prisma.player.update({
      where: { id: playerId },
      data: { status: 'drafted' },
    })

    // Deduct from budget
    await prisma.team.update({
      where: { id: team.id },
      data: { budget: team.budget - player.salary },
    })

    res.status(201).json(roster)
  } catch (error) {
    console.error('Draft error:', error)
    res.status(400).json({ error: error instanceof Error ? error.message : 'Draft failed' })
  }
}

export async function releasePlayerHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const { playerId } = req.body

    if (!playerId) {
      res.status(400).json({ error: 'Player ID is required' })
      return
    }

    const team = await prisma.team.findUnique({
      where: { userId: req.user.id },
    })

    if (!team) {
      res.status(404).json({ error: 'Team not found' })
      return
    }

    // Get player for salary refund
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    })

    // Remove from roster
    await prisma.teamRoster.deleteMany({
      where: {
        teamId: team.id,
        playerId,
      },
    })

    // Update player status
    await prisma.player.update({
      where: { id: playerId },
      data: { status: 'available' },
    })

    // Refund salary
    if (player) {
      await prisma.team.update({
        where: { id: team.id },
        data: { budget: team.budget + player.salary },
      })
    }

    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Release failed' })
  }
}

export async function getRoster(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const team = await prisma.team.findUnique({
      where: { userId: req.user.id },
    })

    if (!team) {
      res.status(404).json({ error: 'Team not found' })
      return
    }

    const roster = await prisma.teamRoster.findMany({
      where: { teamId: team.id },
      include: {
        player: true,
      },
      orderBy: { number: 'asc' },
    })

    res.json(roster)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roster' })
  }
}

export async function searchPlayersHandler(req: Request, res: Response): Promise<void> {
  try {
    const { q, position } = req.query

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' })
      return
    }

    const players = await prisma.player.findMany({
      where: {
        AND: [
          {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
            ],
          },
          position ? { position: position as string } : {},
        ],
      },
      orderBy: { overall: 'desc' },
      take: 20,
    })

    res.json(players)
  } catch (error) {
    res.status(500).json({ error: 'Search failed' })
  }
}
