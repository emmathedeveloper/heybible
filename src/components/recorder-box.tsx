import { Button } from "@/components/ui/button"
import { useConnectionStore } from "@/lib/connection"
import { useRecordingStore } from "@/lib/recording"

const RecorderBox = () => {

    const { setOnAudioChunk, isRecording, start, stop } = useRecordingStore()
    const { sendMessage , status , connect , disconnect } = useConnectionStore()

    const handleClick = async () => {
        
        if(status == 'connected'){
            disconnect()

            stop();
    
            setOnAudioChunk(undefined)
        }else {
            connect()

            setOnAudioChunk((audioData) => {
                sendMessage({ type: 'realtimeInput', audioData })
            })

            await start();
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

export default RecorderBox