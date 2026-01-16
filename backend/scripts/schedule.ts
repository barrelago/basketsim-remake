#!/usr/bin/env tsx
import { scheduleRoundRobin } from '../src/services/matchService.js'

async function main() {
  try {
    const startDate = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'
    console.log('Scheduling league matches starting', startDate)
    const matches = await scheduleRoundRobin(startDate, false)
    console.log(`Created ${matches.length} matches`)
    matches.forEach((m: any) => console.log(`- ${m.id} ${m.homeTeamId} vs ${m.awayTeamId} (${m.type})`))
  } catch (err: any) {
    console.error('Failed to schedule matches:', err?.message ?? err)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
