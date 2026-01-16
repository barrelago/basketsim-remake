import express, { Router } from 'express'
import {
  getAvailablePlayers,
  getPlayer,
  draftPlayerHandler,
  releasePlayerHandler,
  getRoster,
  searchPlayersHandler,
} from '../controllers/playerController.js'
import { authMiddleware } from '../middleware/auth.js'

const router: Router = express.Router()

router.post('/draft', authMiddleware, draftPlayerHandler)
router.post('/release', authMiddleware, releasePlayerHandler)
router.get('/me/roster', authMiddleware, getRoster)
router.get('/search', searchPlayersHandler)
router.get('/', getAvailablePlayers)
router.get('/:id', getPlayer)

export default router
