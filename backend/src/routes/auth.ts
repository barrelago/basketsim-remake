import express from 'express'
import { registerHandler, loginHandler, meHandler } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)
router.get('/me', authMiddleware, meHandler)

export default router
