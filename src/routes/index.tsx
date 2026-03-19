import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import ControlPanelView from '../views/ControlPanelView'
import ProjectorView from '../views/ProjectorView'
import SplashView from '@/views/SplashView'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: z.object({ view: z.enum(['splash' , 'control-panel' , 'projector']).default('splash') })
})

function RouteComponent() {

  const { view } = Route.useSearch()

  if(view == 'splash') return <SplashView />

  if(view == 'control-panel') return <ControlPanelView />

  return <ProjectorView />
}