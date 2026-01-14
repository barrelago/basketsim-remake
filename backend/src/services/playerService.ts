import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllPlayers(status = 'available') {
  return prisma.player.findMany({
    where: { status },
    orderBy: { overall: 'desc' },
  })
}

export async function getPlayerById(id: number) {
  return prisma.player.findUnique({
    where: { id },
  })
}

export async function createPlayer(data: any) {
  return prisma.player.create({
    data,
  })
}

export async function draftPlayer(teamId: number, playerId: number, position: string, number: number) {
  // Check if player is available
  const player = await prisma.player.findUnique({
    where: { id: playerId },
  })

  if (!player || player.status !== 'available') {
    throw new Error('Player is not available for draft')
  }

  // Check team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  })

  if (!team) {
    throw new Error('Team not found')
  }

  // Check budget
  if (team.budget < player.salary) {
    throw new Error('Insufficient budget to draft this player')
  }

  // Draft the player
  const roster = await prisma.teamRoster.create({
    data: {
      teamId,
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
    where: { id: teamId },
    data: { budget: team.budget - player.salary },
  })

  return roster
}

export async function releasePlayer(teamId: number, playerId: number) {
  // Get player to refund salary
  const player = await prisma.player.findUnique({
    where: { id: playerId },
  })

  // Remove from roster
  await prisma.teamRoster.deleteMany({
    where: {
      teamId,
      playerId,
    },
  })

  // Update player status
  await prisma.player.update({
    where: { id: playerId },
    data: { status: 'available' },
  })

  // Refund salary to team
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  })

  if (team && player) {
    await prisma.team.update({
      where: { id: teamId },
      data: { budget: team.budget + player.salary },
    })
  }

  return { success: true }
}

export async function getTeamRoster(teamId: number) {
  return prisma.teamRoster.findMany({
    where: { teamId },
    include: {
      player: true,
    },
    orderBy: { number: 'asc' },
  })
}

export async function searchPlayers(query: string, position?: string) {
  return prisma.player.findMany({
    where: {
      AND: [
        {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
          ],
        },
        position ? { position } : {},
      ],
    },
    orderBy: { overall: 'desc' },
    take: 20,
  })
}
