import { Client } from './client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientProvider } from './contexts/client-context'
import { AuthenticationProvider } from './contexts/authentication-context/authentication-provider'
import { RouterProvider } from 'react-router'
import { router } from './router'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from 'sonner'

const client = new Client({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (failureCount > 3) {
          return false
        }

        if (
          Client.isBadRequest(error) ||
          Client.isNotFound(error) ||
          Client.isForbidden(error)
        ) {
          return false
        }

        return true
      }
    }
  }
})

export function App() {
  return (
    <ClientProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
        </AuthenticationProvider>
        <Toaster />
      </QueryClientProvider>
    </ClientProvider>
  )
}
