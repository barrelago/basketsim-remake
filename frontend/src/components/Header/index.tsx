import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export interface HeaderProps {
  title?: string
}

export function Header({ title = '🏀 BasketSim' }: HeaderProps) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <header className="bg-blue-950 text-white py-4 shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div
          className="cursor-pointer"
          onClick={() => navigate('/')}
        >
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>

        {user && (
          <nav className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="text-blue-200 hover:text-white transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/team')}
              className="text-blue-200 hover:text-white transition"
            >
              Team
            </button>
            <button
              onClick={() => navigate('/players')}
              className="text-blue-200 hover:text-white transition"
            >
              Players
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="text-blue-200 hover:text-white transition"
              >
                Admin
              </button>
            )}

            <div className="flex items-center gap-4 border-l border-blue-700 pl-8">
              <div className="text-right text-sm">
                <p className="font-semibold">{user.name}</p>
                <p className="text-blue-300">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
