import { useEffect, useState } from 'react'
import { Verse } from '../lib/bible'

const ProjectorView = () => {

  const [currentVerse , setCurrentVerse] = useState<Verse|null>() 


  useEffect(() => {
    window.ipcRenderer.on("DISPLAY_VERSE" , (_ , { verse }) => {
      console.log(verse)
      setCurrentVerse(verse)
    })
  } , [])

  return (
    <div className='size-full flex flex-col items-center justify-center'>
      {
        currentVerse &&
        <div className='flex flex-col items-center justify-center gap-4'>
          <h1 className='text-center'>{currentVerse.text}</h1>
        </div>
      }
    </div>
  )
}

export default ProjectorView