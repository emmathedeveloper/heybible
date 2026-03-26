import { useEffect, useState } from 'react'
import { VerseWithTranslation } from '../lib/bible'

const ProjectorView = () => {

  const [currentVerse, setCurrentVerse] = useState<VerseWithTranslation | null>()

  const [background, setBackground] = useState<string | null>()


  useEffect(() => {
    window.ipcRenderer.on("DISPLAY_VERSE", (_, { verse }) => {
      setCurrentVerse(verse)
    })

    window.ipcRenderer.on("CHANGE_BACKGROUND", (_, { background }) => {
      console.log(background)
      setBackground(background)
    })
  }, [])

  return (
    <div className='size-full flex flex-col items-center justify-center relative z-0 p-2'>
      {
        background &&
        <img
          src={background}
          alt={background}
          className="transition-all absolute top-0 left-0 size-full object-cover -z-1"
        />
      }
      {
        currentVerse &&
        <div className='flex flex-col items-center justify-center gap-4'>
          <h1 className='text-center verse'>{currentVerse.text}</h1>
          <p className='text-center verse-sub'>{currentVerse.book_id} {currentVerse.chapter}:{currentVerse.verse} - {currentVerse.translation}</p>
        </div>
      }
    </div>
  )
}

export default ProjectorView