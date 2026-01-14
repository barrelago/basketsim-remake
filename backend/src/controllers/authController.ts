import { Request, Response } from 'express'
import { register, login, getCurrentUser } from '../services/authService.js'

export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' })
      return
    }

    const result = await register({ email, password, name })
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Registration failed' })
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const result = await login({ email, password })
    res.json(result)
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : 'Login failed' })
  }
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const user = await getCurrentUser(req.user.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' })
  }
}
