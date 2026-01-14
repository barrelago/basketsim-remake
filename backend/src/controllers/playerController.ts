import { Request, Response } from 'express'
import {
  getAllPlayers,
  getPlayerById,
  draftPlayer,
  releasePlayer,
  getTeamRoster,
  searchPlayers,
} from '../services/playerService.js'

export async function getAvailablePlayers(req: Request, res: Response): Promise<void> {
  try {
    const players = await getAllPlayers('available')
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' })
  }
}

export async function getPlayer(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const player = await getPlayerById(parseInt(id))
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
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    // Get user's team
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const team = await prisma.team.findUnique({
      where: { userId: req.user.id },
    })

    if (!team) {
      res.status(404).json({ error: 'Team not found' })
      return
    }

    const roster = await draftPlayer(team.id, playerId, position, number)
    res.json(roster)
  } catch (error) {
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

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const team = await prisma.team.findUnique({
      where: { userId: req.user.id },
    })

    if (!team) {
      res.status(404).json({ error: 'Team not found' })
      return
    }

    const result = await releasePlayer(team.id, playerId)
    res.json(result)
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

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const team = await prisma.team.findUnique({
      where: { userId: req.user.id },
    })

    if (!team) {
      res.status(404).json({ error: 'Team not found' })
      return
    }

    const roster = await getTeamRoster(team.id)
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

    const players = await searchPlayers(q, position as string | undefined)
    res.json(players)
  } catch (error) {
    res.status(500).json({ error: 'Search failed' })
  }
}
