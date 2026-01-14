export interface JwtPayload {
  id: number
  email: string
  role: string
}

export interface AuthRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
    role: string
  }
}
