import useBibleStore, { Verse } from '@/lib/bible'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'

const CurrentChapterPane = () => {
  const { currentBook, currentChapter, currentVerse, activeVersion, bibleCache } = useBibleStore()
  const [verses, setVerses] = useState<Verse[]>([])
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const found = bibleCache.get(`${currentBook}:${currentChapter}:${activeVersion}`)
    if (found) setVerses(found)
  }, [currentBook, currentChapter, activeVersion, bibleCache])

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentVerse])

  return (
    <div className='size-full flex flex-col'>
      {verses.length > 0 && (
        <>
          <div className='w-full p-2'>
            <h3 className='text-2xl font-bold'>{currentBook} {currentChapter}</h3>
          </div>
          <div className='flex-1 overflow-scroll space-y-3 p-2'>
            {verses.map((v, i) => (
              <div
                key={i}
                ref={currentVerse?.verse === v.verse ? activeRef : null}
                className={cn(
                  'w-full flex gap-2 p-2 cursor-pointer rounded-xl',
                  { 'bg-primary/50 text-primary border-2 border-primary': currentVerse?.verse === v.verse }
                )}
              >
                <small>{v.verse}</small>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CurrentChapterPane