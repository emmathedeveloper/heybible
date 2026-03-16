import React from 'react'
import useBibleStore from '../lib/bible'

const ProjectorView = () => {

  const currentVerse = useBibleStore(s => s.currentVerse)

  return (
    <div>

    </div>
  )
}

export default ProjectorView