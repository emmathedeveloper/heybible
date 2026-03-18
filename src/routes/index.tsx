import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import ControlPanelView from '../view/ControlPanelView'
import ProjectorView from '../view/ProjectorView'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: z.object({ view: z.enum(['control-panel' , 'projector']).default('control-panel') })
})

function RouteComponent() {

  const { view } = Route.useSearch()

  if(view == 'control-panel') return <ControlPanelView />

  return <ProjectorView />
}