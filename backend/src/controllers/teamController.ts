import { Request, Response } from 'express'
import { createTeam, getUserTeam, updateTeam, deleteTeam, getAllTeams } from '../services/teamService.js'

export async function createTeamHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const { name, country } = req.body

    if (!name || !country) {
      res.status(400).json({ error: 'Name and country are required' })
      return
    }

    const team = await createTeam(req.user.id, { name, country })
    res.status(201).json(team)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create team' })
  }
}

export async function getMyTeamHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const team = await getUserTeam(req.user.id)
    if (!team) {
      res.status(404).json({ error: 'Team not found' })
      return
    }

    res.json(team)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' })
  }
}

export async function updateTeamHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const { name, country } = req.body
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const team = await prisma.team.findUnique({
      where: { userId: req.user.id },
    })

    if (!team) {
      res.status(404).json({ error: 'Team not found' })
      return
    }

    const updated = await updateTeam(team.id, { name, country })
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update team' })
  }
}

export async function deleteTeamHandler(req: Request, res: Response): Promise<void> {
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

    await deleteTeam(team.id)
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete team' })
  }
}

export async function getAllTeamsHandler(req: Request, res: Response): Promise<void> {
  try {
    const teams = await getAllTeams()
    res.json(teams)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' })
  }
}
