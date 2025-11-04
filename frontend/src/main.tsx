import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // Data is fresh for 30 seconds
      cacheTime: 300000, // Cache for 5 minutes
      refetchOnMount: false, // Don't refetch on mount if data is fresh
    },
  },
})

// Remove StrictMode in production for better performance (it causes double renders)
const isDevelopment = import.meta.env.DEV

const AppWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  </QueryClientProvider>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  isDevelopment ? (
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  ) : (
    <AppWrapper />
  )
)
