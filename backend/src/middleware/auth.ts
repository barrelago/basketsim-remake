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

export function requireRole(roles: string | string[]) {
  const allowed = Array.isArray(roles) ? roles : [roles]
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' })
        return
      }

      if (!allowed.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' })
        return
      }

      next()
    } catch (error) {
      res.status(403).json({ error: 'Access denied' })
    }
  }
}
