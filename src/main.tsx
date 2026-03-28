import ReactDOM from 'react-dom/client'
import { RouterProvider, createHashHistory, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import "./index.css"


gsap.registerPlugin(useGSAP , SplitText)

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { SplitText } from 'gsap/SplitText'

// Create a new router instance
const router = createRouter({ 
  routeTree,
  history: createHashHistory()
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const client = new QueryClient({
  defaultOptions: {}
})

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}