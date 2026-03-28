import { create } from "zustand";

const SUPPORTED_TRANSLATIONS = ["NLT", "NASB", "NKJV", "AMP", "MSG", "ESV", "NIRV", "NIV", "KJV", "ERV", "YB"]

export type Verse = {
    book_id: string,
    book_name: string,
    chapter: number,
    verse: number,
    text: string
}

export type VerseWithTranslation = Verse & { translation: string }

type BibleStoreType = {
    activeVersion: string,
    currentBook: string,
    currentChapter: number,
    currentVerseNumber: number,

    currentVerse: Verse | null,

    bibleCache: Map<string, Verse[]>

    getBiblePassage: (book: string, chapter: number, verse?: number) => Promise<Verse>,
    navigateToVerse: (direction: 'next' | 'previous' | 'jump', steps: number, target_verse?: number) => Promise<Verse>,
    setBibleVersion: (version: string) => Promise<Verse>
}

const useBibleStore = create<BibleStoreType>((set, get) => ({

    activeVersion: 'KJV',
    currentBook: '',
    currentChapter: 1,
    currentVerseNumber: 1,

    currentVerse: null,

    bibleCache: new Map<string, Verse[]>(),


    async getBiblePassage(book: string, chapter: number, verse?: number) {
        try {


            const { activeVersion, bibleCache } = get()

            const cache = bibleCache.get(`${book}:${chapter}:${activeVersion}`)

            const verseNum = verse ?? 1;

            if (cache) {
                const foundVerse = cache.find((v: Verse) => v.verse == verseNum)

                console.log(foundVerse)

                set({
                    currentBook: book,
                    currentChapter: chapter,
                    currentVerseNumber: verseNum,
                    currentVerse: foundVerse
                })

                return { ...foundVerse, translation: activeVersion }
            }

            const response = await fetch(`./bibles/${activeVersion.toLowerCase()}/${book.replace(' ', '_').toLowerCase()}/${chapter}.json`);
            
            const data = await response.json();

            const foundVerse = data.find((v: Verse) => v.verse == verseNum)

            const newCache = new Map(bibleCache)

            newCache.set(`${book}:${chapter}:${activeVersion}`, data)

            set({
                currentBook: book,
                currentChapter: chapter,
                currentVerseNumber: verseNum,
                currentVerse: foundVerse,
                bibleCache: newCache
            })


            return { ...foundVerse, translation: activeVersion }
        } catch (error) {
            return { success: false, error: 'Failed to fetch passage' };
        }
    },

    async navigateToVerse(direction: 'next' | 'previous' | 'jump', steps = 1, target_verse?: number) {

        const { getBiblePassage, currentVerseNumber, currentBook, currentChapter } = get()

        let newVerse = currentVerseNumber;

        if (direction === 'next') newVerse = currentVerseNumber + steps;
        else if (direction === 'previous') newVerse = Math.max(1, currentVerseNumber - steps);
        else if (direction === 'jump' && target_verse) newVerse = target_verse;

        return await getBiblePassage(currentBook, currentChapter, newVerse);
    },

    async setBibleVersion(version: string) {

        const { getBiblePassage, currentVerseNumber, currentBook, currentChapter } = get()

        const v = SUPPORTED_TRANSLATIONS.find(v => v.toLowerCase() == version.toLowerCase()) || SUPPORTED_TRANSLATIONS[0]

        set({ activeVersion: v.toUpperCase() })

        console.log(`Bible version set to: ${version.toUpperCase()}`);
        return await getBiblePassage(currentBook, currentChapter, currentVerseNumber);
    }
}))


export default useBibleStore
