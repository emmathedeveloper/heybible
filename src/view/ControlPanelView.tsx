import { Button } from "@/components/ui/button"
import useBibleStore from "@/lib/bible"
import { useRecordingStore } from "@/lib/recording"
import { useEffect } from "react"

const ControlPanelView = () => {

    const { setOnAudioChunk, isRecording, start, stop } = useRecordingStore()

    const handleClick = async () => {

        if (!isRecording) {
            await window.ipcRenderer.send('start-ai-session')

            setOnAudioChunk((audioData) => {
                window.ipcRenderer.send('audio-chunk', { audioData })
            })

            await start();
        } else {
            window.ipcRenderer.send('end-ai-session')

            stop();

            setOnAudioChunk(undefined)
        }
    }

    useEffect(() => {
        window.ipcRenderer.on("get-bible-passage", (_, data) => {
            console.log(data)

            useBibleStore.getState().getBiblePassage(data.book, data.chapter, data.verse).then(verse => {
                window.ipcRenderer.send("message:projector", { type: "DISPLAY_VERSE", verse })
            })
        })

        window.ipcRenderer.on("navigate-to-verse", (_, data) => {
            console.log(data)
            useBibleStore.getState().navigateToVerse(data.direction, data.steps, data.target_verse)
        })

        window.ipcRenderer.on("set-bible-version", (_, data) => {
            console.log(data)
            useBibleStore.getState().setBibleVersion(data.version)
        })
    }, [])

    return (
        <div className="size-full flex items-center justify-center">
            <Button onClick={handleClick}>
                {!isRecording ? "Start Session" : "End Session"}
            </Button>
        </div>
    )
}

export default ControlPanelView