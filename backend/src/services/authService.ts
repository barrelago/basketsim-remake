import { PrismaClient } from '@prisma/client'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'
import { AuthRequest, AuthResponse } from '../types/index.js'

const prisma = new PrismaClient()

export async function register(data: AuthRequest): Promise<AuthResponse> {
  const { email, password, name } = data

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }

  if (!name || name.trim().length === 0) {
    throw new Error('Name is required')
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  })

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  }
}

export async function login(data: AuthRequest): Promise<AuthResponse> {
  const { email, password } = data

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid password')
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  }
}

export async function getCurrentUser(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })
}
