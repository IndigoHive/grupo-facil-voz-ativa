import { createBrowserRouter } from 'react-router'
import { AuthenticationGuard } from './components/AuthenticationGuard'
import { Layout } from './layout'
import { LoginPage } from './pages/LoginPage'

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
