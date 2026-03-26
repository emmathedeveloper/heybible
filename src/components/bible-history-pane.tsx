import useBibleStore, { Verse } from "@/lib/bible"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type Transformed = {
  book: string,
  chapter: string,
  translations: { [x: string]: Verse[] }
}

const BibleHistoryPane = () => {

  const [transformed, setTransformed] = useState<Transformed[]>([])

  const { bibleCache, activeVersion } = useBibleStore()

  const transformCache = (cache: Map<string, Verse[]>) => {

    const transformed = Array.from(cache.entries()).reduce((prev: Transformed[], [key, value]: [string, Verse[]]) => {

      const [book, chapter, translation] = key.split(':')

      const existing = prev.find(b => b.book == book && b.chapter == chapter);

      if (existing) {
        existing["translations"][translation] = value;
      } else {
        prev.push({ book, chapter, translations: { [translation]: value } });
      }

      return prev
    }, [])

    setTransformed(transformed)
  }

  useEffect(() => {
    transformCache(bibleCache)
  }, [bibleCache])

  return (
    <div className='size-full p-4 space-y-2'>
      {transformed.map((t, i) => (
        <div key={i} className="p-4 rounded-xl group hover:bg-secondary flex flex-col gap-2 select-none cursor-pointer transition-all">
          <h1>{t.book} {t.chapter}</h1>

          <p className="text-muted group-hover:text-foreground truncate">{t.translations[activeVersion]?.[0].text}</p>

          <div className="flex items-center gap-2">
            {Object.keys(t.translations).map((translation, i) => (
              <small
                key={i}
                className={cn(
                  "px-1 rounded bg-primary text-primary-foreground",
                )}
              >
                {translation}
              </small>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default BibleHistoryPane
