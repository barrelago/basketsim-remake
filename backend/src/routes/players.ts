import express from 'express'
import {
  getAvailablePlayers,
  getPlayer,
  draftPlayerHandler,
  releasePlayerHandler,
  getRoster,
  searchPlayersHandler,
} from '../controllers/playerController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAvailablePlayers)
router.get('/search', searchPlayersHandler)
router.get('/:id', getPlayer)

// Protected routes
router.post('/draft', authMiddleware, draftPlayerHandler)
router.post('/release', authMiddleware, releasePlayerHandler)
router.get('/me/roster', authMiddleware, getRoster)

export default router
