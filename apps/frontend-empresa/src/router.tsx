import { createBrowserRouter } from 'react-router'
import { AuthenticationGuard } from './components/AuthenticationGuard'
import { Layout } from './layout'
import { LoginPage } from './pages/LoginPage'
import { SelecionarEmpresaPage } from './pages/SelecionarEmpresaPage'
import { UsuariosPage } from './pages/Usuarios'
import { ChavesApiPage } from './pages/ChavesApiPage'
import { GatilhosPage } from './pages/GatilhosPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <AuthenticationGuard signInPath={'/login'} requiresEmpresa={false}>
        <SelecionarEmpresaPage />
      </AuthenticationGuard>
    )
  },
  {
    path: '/:empresaSlug',
    element: (
      <AuthenticationGuard signInPath={'/login'} requiresEmpresa={true}>
        <Layout />
      </AuthenticationGuard>
    ),
    children: [
      {
        path: 'usuarios',
        element: <UsuariosPage />
      },
      {
        path: 'chaves-api',
        element: <ChavesApiPage />
      },
      {
        path: 'gatilhos',
        element: <GatilhosPage />
      }
    ]
  }
])
