import { useEffect, useRef, useState } from 'react'
import { VerseWithTranslation } from '../lib/bible'
import { ANIMATIONS_MAP } from '@/components/design-pane/animations'
import { AnimationKey } from '@/lib/design'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const ProjectorView = () => {
  const [currentVerse, setCurrentVerse] = useState<VerseWithTranslation | null>()
  const [displayVerse, setDisplayVerse] = useState<VerseWithTranslation | null>()
  const [background, setBackground] = useState<string | null>()
  const [font, setFont] = useState<string>('geist')
  const [animation, setAnimation] = useState<AnimationKey>('fade')
  const textRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    window.ipcRenderer.on("DISPLAY_VERSE", (_, { verse }) => setCurrentVerse(verse))
    window.ipcRenderer.on("CHANGE_BACKGROUND", (_, { background }) => setBackground(background))
    window.ipcRenderer.on("CHANGE_FONT", (_, { font }) => setFont(font))
    window.ipcRenderer.on("CHANGE_ANIMATION", (_, { animation }) => setAnimation(animation))
  }, [])

useGSAP(() => {
  if (!currentVerse) return

  if (!displayVerse) {
    setDisplayVerse(currentVerse)
    return
  }

  if (!textRef.current || !subRef.current) return
  const targets = [textRef.current, subRef.current]

  gsap.killTweensOf(targets)  // add this
  gsap.killTweensOf('*')      // kill any split char/word/line tweens too

  gsap.to(targets, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
    onComplete: () => {
      setDisplayVerse(currentVerse)
      gsap.set(targets, { opacity: 0 })
    }
  })
}, { dependencies: [currentVerse] })

  useGSAP(() => {
    if (!displayVerse || !textRef.current || !subRef.current) return
    ANIMATIONS_MAP[animation]([textRef.current, subRef.current])
  }, { dependencies: [displayVerse] })

  return (
    <div className='size-full flex flex-col items-center justify-center relative z-0 p-2'>
      {background && (
        <img
          src={background}
          alt={background}
          className="transition-all absolute top-0 left-0 size-full object-cover -z-1"
        />
      )}
      {displayVerse && (
        <div data-font={font} className='flex flex-col items-center justify-center gap-4'>
          <h1 ref={textRef} className='text-center verse'>{displayVerse.text}</h1>
          <p ref={subRef} className='text-center verse-sub'>{displayVerse.book_id} {displayVerse.chapter}:{displayVerse.verse} - {displayVerse.translation}</p>
        </div>
      )}
    </div>
  )
}

export default ProjectorView