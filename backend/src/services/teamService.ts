import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const MIN_LEAGUE_SIZE = 10

async function ensureLeagueSize(country: string) {
  const teams = await prisma.team.findMany({
    where: { country },
    select: { id: true, name: true },
  })
  let count = teams.length
  if (count >= MIN_LEAGUE_SIZE) return

  const nameSet = new Set(teams.map((t) => t.name))
  let botIndex = 1

  while (count < MIN_LEAGUE_SIZE) {
    let name = `${country} Bots ${botIndex}`
    while (nameSet.has(name)) {
      botIndex += 1
      name = `${country} Bots ${botIndex}`
    }
    await prisma.team.create({
      data: {
        name,
        country,
        userId: null,
      },
    })
    nameSet.add(name)
    botIndex += 1
    count += 1
  }
}

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

  const created = await prisma.team.create({
    data: {
      name: data.name,
      country: data.country,
      userId,
    },
  })

  await ensureLeagueSize(data.country)

  return created
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
  const existingTeam = await prisma.team.findUnique({
    where: { id: teamId },
    select: { country: true },
  })

  if (!existingTeam) {
    throw new Error('Team not found')
  }

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

  const updated = await prisma.team.update({
    where: { id: teamId },
    data,
  })

  if (data.country && data.country !== existingTeam.country) {
    await ensureLeagueSize(existingTeam.country)
    await ensureLeagueSize(data.country)
  }

  return updated
}

export async function deleteTeam(teamId: number) {
  const existingTeam = await prisma.team.findUnique({
    where: { id: teamId },
    select: { country: true },
  })

  if (!existingTeam) {
    throw new Error('Team not found')
  }

  // Delete roster entries first
  await prisma.teamRoster.deleteMany({
    where: { teamId },
  })

  const deleted = await prisma.team.delete({
    where: { id: teamId },
  })

  await ensureLeagueSize(existingTeam.country)

  return deleted
}

export async function getAllTeams() {
  const countries = await prisma.team.findMany({
    select: { country: true },
    distinct: ['country'],
  })
  await Promise.all(countries.map((c) => ensureLeagueSize(c.country)))

  return prisma.team.findMany({
    include: {
      roster: true,
    },
    orderBy: { wins: 'desc' },
  })
}
