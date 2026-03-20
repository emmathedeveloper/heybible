import { Button } from "@/components/ui/button"
import { useConnectionStore } from "@/lib/connection"
import { useRecordingStore } from "@/lib/recording"

const ControlPanelView = () => {

    const { setOnAudioChunk, isRecording, start, stop } = useRecordingStore()
    const { sendMessage , status , connect , disconnect } = useConnectionStore()

    const handleClick = async () => {

        if (!isRecording) {
            connect()

            setOnAudioChunk((audioData) => {
                sendMessage({ type: 'realtimeInput', audioData })
            })

            await start();
        } else {
            disconnect()

            stop();

            setOnAudioChunk(undefined)
        }
    }

    return (
        <div className="size-full flex items-center justify-center">
            <Button onClick={handleClick}>
                {!isRecording && status == 'disconnected'  ? "Start Session" : "End Session"}
            </Button>
        </div>
    )
}

export default ControlPanelView