import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from "react-hot-toast"

const RootLayout = () => (
  <>
    <Toaster toastOptions={{ duration: 5000 }}/>
    <Outlet />
  </>
)

export const Route = createRootRoute({ component: RootLayout })