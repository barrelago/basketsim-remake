import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import { JwtPayload } from '../types/index.js'

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRATION = (process.env.JWT_EXPIRATION || '7d') as SignOptions['expiresIn']

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}
