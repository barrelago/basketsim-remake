import express, { Router } from 'express'
import {
  createTeamHandler,
  getMyTeamHandler,
  updateTeamHandler,
  deleteTeamHandler,
  getAllTeamsHandler,
} from '../controllers/teamController.js'
import { authMiddleware } from '../middleware/auth.js'

const router: Router = express.Router()

router.get('/', getAllTeamsHandler)
router.post('/', authMiddleware, createTeamHandler)
router.get('/me', authMiddleware, getMyTeamHandler)
router.put('/me', authMiddleware, updateTeamHandler)
router.delete('/me', authMiddleware, deleteTeamHandler)

export default router
