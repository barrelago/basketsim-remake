import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import playerRouter from './routes/players.js'
import teamRouter from './routes/teams.js'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 3000

app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true 
}))
app.use(express.json())

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'BasketSim API is running',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRouter)
app.use('/api/teams', teamRouter)
app.use('/api/players', playerRouter)

app.get('/', (req: Request, res: Response) => {
  res.json({ 
    name: 'BasketSim API', 
    version: '0.1.0',
  })
})

app.use((err: any, req: Request, res: Response) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
})
