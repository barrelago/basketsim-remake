#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'
import { simulateMatch } from '../src/services/matchService.js'

const prisma = new PrismaClient()

async function runOnce() {
  const now = new Date()
  // Find scheduled matches with playedAt <= now
  const due = await prisma.match.findMany({ where: { status: 'scheduled', playedAt: { lte: now } } })
  if (due.length === 0) return

  for (const m of due) {
    try {
      console.log(`Simulating match ${m.id} scheduled at ${m.playedAt}`)
      await simulateMatch(m.id)
      console.log(`Simulated match ${m.id}`)
    } catch (err: any) {
      console.error(`Failed to simulate match ${m.id}:`, err?.message ?? err)
    }
  }
}

async function main() {
  console.log('Match worker started — checking every 60s')
  await runOnce()
  setInterval(runOnce, 60_000)
}

main().catch((e) => { console.error(e); process.exit(1) })
