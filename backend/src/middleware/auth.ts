import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.js'
import { JwtPayload } from '../types/index.js'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' })
      return
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}
