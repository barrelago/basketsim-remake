import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createTeam(userId: number, data: { name: string; country: string }) {
  // Check if user already has a team
  const existingTeam = await prisma.team.findUnique({
    where: { userId },
  })

  if (existingTeam) {
    throw new Error('User already has a team')
  }

  // Check if team name is unique
  const nameExists = await prisma.team.findUnique({
    where: { name: data.name },
  })

  if (nameExists) {
    throw new Error('Team name already exists')
  }

  if (!data.name || data.name.trim().length < 2) {
    throw new Error('Team name must be at least 2 characters')
  }

  if (!data.country || data.country.trim().length < 2) {
    throw new Error('Country is required')
  }

  return prisma.team.create({
    data: {
      name: data.name,
      country: data.country,
      userId,
    },
  })
}

export async function getUserTeam(userId: number) {
  return prisma.team.findUnique({
    where: { userId },
    include: {
      roster: {
        include: {
          player: true,
        },
        orderBy: { number: 'asc' },
      },
    },
  })
}

export async function updateTeam(teamId: number, data: { name?: string; country?: string }) {
  if (data.name) {
    const nameExists = await prisma.team.findFirst({
      where: {
        AND: [{ name: data.name }, { id: { not: teamId } }],
      },
    })

    if (nameExists) {
      throw new Error('Team name already exists')
    }
  }

  return prisma.team.update({
    where: { id: teamId },
    data,
  })
}

export async function deleteTeam(teamId: number) {
  // Delete roster entries first
  await prisma.teamRoster.deleteMany({
    where: { teamId },
  })

  return prisma.team.delete({
    where: { id: teamId },
  })
}

export async function getAllTeams() {
  return prisma.team.findMany({
    include: {
      roster: true,
    },
    orderBy: { wins: 'desc' },
  })
}
