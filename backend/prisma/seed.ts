import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js'

const prisma = new PrismaClient()

async function main() {
  // Clear existing players
  await prisma.teamRoster.deleteMany({})
  await prisma.player.deleteMany({})

  // Create sample players
  const players = [
    {
      firstName: 'LeBron',
      lastName: 'James',
      age: 38,
      position: 'SF',
      height: "6'9",
      weight: 250,
      speed: 95,
      strength: 98,
      shooting: 87,
      defense: 96,
      stamina: 92,
      salary: 50000,
      overall: 96,
    },
    {
      firstName: 'Luka',
      lastName: 'Doncic',
      age: 24,
      position: 'PG',
      height: "6'7",
      weight: 230,
      speed: 88,
      strength: 92,
      shooting: 94,
      defense: 81,
      stamina: 90,
      salary: 45000,
      overall: 95,
    },
    {
      firstName: 'Kevin',
      lastName: 'Durant',
      age: 35,
      position: 'SF',
      height: "6'10",
      weight: 240,
      speed: 86,
      strength: 90,
      shooting: 96,
      defense: 88,
      stamina: 88,
      salary: 48000,
      overall: 94,
    },
    {
      firstName: 'Giannis',
      lastName: 'Antetokounmpo',
      age: 28,
      position: 'PF',
      height: "6'11",
      weight: 242,
      speed: 87,
      strength: 99,
      shooting: 84,
      defense: 93,
      stamina: 91,
      salary: 46000,
      overall: 94,
    },
    {
      firstName: 'Stephen',
      lastName: 'Curry',
      age: 35,
      position: 'PG',
      height: "6'2",
      weight: 185,
      speed: 90,
      strength: 78,
      shooting: 99,
      defense: 79,
      stamina: 93,
      salary: 44000,
      overall: 93,
    },
    {
      firstName: 'Jayson',
      lastName: 'Tatum',
      age: 25,
      position: 'SF',
      height: "6'8",
      weight: 210,
      speed: 89,
      strength: 91,
      shooting: 90,
      defense: 88,
      stamina: 89,
      salary: 41000,
      overall: 92,
    },
    {
      firstName: 'Joel',
      lastName: 'Embiid',
      age: 28,
      position: 'C',
      height: "7'0",
      weight: 280,
      speed: 82,
      strength: 98,
      shooting: 86,
      defense: 94,
      stamina: 85,
      salary: 43000,
      overall: 93,
    },
    {
      firstName: 'Damian',
      lastName: 'Lillard',
      age: 33,
      position: 'PG',
      height: "6'2",
      weight: 195,
      speed: 85,
      strength: 82,
      shooting: 95,
      defense: 76,
      stamina: 88,
      salary: 39000,
      overall: 90,
    },
  ]

  for (const player of players) {
    await prisma.player.create({
      data: player,
    })
  }

  console.log('✅ Seeded 8 players')

  // Create admin and a second user to own teams
  const adminPassword = await hashPassword('adminpass')
  const ownerPassword = await hashPassword('ownerpass')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@basketsim.test' },
    update: {
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
    },
    create: {
      email: 'admin@basketsim.test',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
    },
  })

  const owner = await prisma.user.upsert({
    where: { email: 'owner1@basketsim.test' },
    update: {
      name: 'Owner One',
      password: ownerPassword,
      role: 'player',
    },
    create: {
      email: 'owner1@basketsim.test',
      name: 'Owner One',
      password: ownerPassword,
      role: 'player',
    },
  })

  // Create two teams owned by the users
  const teamA = await prisma.team.upsert({
    where: { name: 'Team Alpha' },
    update: { country: 'USA', userId: admin.id },
    create: { name: 'Team Alpha', country: 'USA', userId: admin.id },
  })

  const teamB = await prisma.team.upsert({
    where: { name: 'Team Beta' },
    update: { country: 'USA', userId: owner.id },
    create: { name: 'Team Beta', country: 'USA', userId: owner.id },
  })

  // Assign first half of players to Team Alpha, rest to Team Beta
  const allPlayers = await prisma.player.findMany({ orderBy: { id: 'asc' } })
  const half = Math.ceil(allPlayers.length / 2)

  for (let i = 0; i < allPlayers.length; i++) {
    const p = allPlayers[i]
    await prisma.teamRoster.create({
      data: {
        teamId: i < half ? teamA.id : teamB.id,
        playerId: p.id,
        position: p.position,
        number: 7 + i,
      },
    })
  }

  console.log('✅ Created admin, owner, two teams, and assigned players to rosters')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
