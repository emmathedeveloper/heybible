import { create, createStore, useStore } from "zustand";

type Verse = {
    book_id: string,
    book_name: string,
    chapter: number,
    verse: number,
    text: string
}

type BibleStoreType = {
    activeVersion: string,
    currentBook: string,
    currentChapter: number,
    currentVerseNumber: number,

    currentVerse: Verse | null

    getBiblePassage: (book: string, chapter: number, verse?: number) => Promise<any>
}

const BibleCache = new Map<string , Verse[]>()

const useBibleStore = create<BibleStoreType>((set, get) => ({

    activeVersion: 'KJV',
    currentBook: '',
    currentChapter: 1,
    currentVerseNumber: 1,

    currentVerse: null,
    


    async getBiblePassage(book: string, chapter: number, verse?: number) {
        try {

            
            const { activeVersion } = get()

            const cache = BibleCache.get(`${book}:${chapter}:${activeVersion}`)

            if(cache) {
                console.log("Cache Exists")
            }

            const verseNum = verse ?? 1;
            const ref = `${book}+${chapter}`;
            const response = await fetch(`https://bible-api.com/${ref}?translation=${activeVersion.toLowerCase()}`);
            const data = await response.json();

            const foundVerse = data.verses.find((v: Verse) => v.verse == verseNum)

            set({ 
                currentBook: book , 
                currentChapter: chapter , 
                currentVerseNumber: verseNum,
                currentVerse: foundVerse
            })

            BibleCache.set(`${book}:${chapter}:${activeVersion}` , data.verses)

            return { success: true, reference: data.reference, text: data.text, translation: activeVersion };
        } catch (error) {
            return { success: false, error: 'Failed to fetch passage' };
        }
    },

    async navigateToVerse(direction: 'next' | 'previous' | 'jump', steps = 1, target_verse?: number) {
        
        const { getBiblePassage , currentVerseNumber , currentBook , currentChapter } = get()
        
        let newVerse = currentVerseNumber;

        if (direction === 'next') newVerse = currentVerseNumber + steps;
        else if (direction === 'previous') newVerse = Math.max(1, currentVerseNumber - steps);
        else if (direction === 'jump' && target_verse) newVerse = target_verse;

        return await getBiblePassage(currentBook, currentChapter, newVerse);
    },

    async setBibleVersion(version: string) {
        set({ activeVersion: version.toUpperCase() })

        console.log(`Bible version set to: ${version.toUpperCase()}`);
        return { success: true, version: version.toUpperCase() };
    }
}))


window.ipcRenderer.on("get-bible-passage" , (data) => {
    console.log(data)
})

window.ipcRenderer.on("navigate-to-verse" , (data) => {
    console.log(data)
})

window.ipcRenderer.on("set-bible-version" , (data) => {
    console.log(data)
})


export default useBibleStore