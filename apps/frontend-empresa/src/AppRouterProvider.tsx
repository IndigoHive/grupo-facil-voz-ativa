import { Layout } from 'lucide-react'
import { createBrowserRouter } from 'react-router'
import { LoginPage } from './pages/LoginPage'
import { AuthenticationGuard } from './components/AuthenticationGuard'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <AuthenticationGuard signInPath={'/login'}>
        <Layout />
      </AuthenticationGuard>
    )
  }
])
