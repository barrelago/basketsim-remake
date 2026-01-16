import express, { Router } from 'express'
import { scheduleMatches, listMatches, handleSimulate, getMatch, rescheduleMatches } from '../controllers/matchController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router: Router = express.Router()

router.get('/', authMiddleware, listMatches)
router.get('/:id', getMatch)
router.post('/schedule', authMiddleware, requireRole('admin'), scheduleMatches)
router.post('/:id/simulate', authMiddleware, handleSimulate)
router.post('/reschedule', authMiddleware, requireRole('admin'), rescheduleMatches)

export default router
