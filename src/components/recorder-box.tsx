import { Button } from "@/components/ui/button"
import { useConnectionStore } from "@/lib/connection"
import { useRecordingStore } from "@/lib/recording"
import { useAudioWaveform } from "@/lib/wave-form"
import { AudioWaveformIcon, BotOffIcon, MicIcon, MicOffIcon } from "lucide-react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useEffect } from "react"

const RecorderBox = () => {

    const {
        setOnAudioChunk,
        isRecording,
        start,
        stop,
        isMuted,
        toggleMute,
        loadDevices,
        availableDevices,
        setSelectedDeviceId,
        selectedDeviceId
    } = useRecordingStore()
    const { sendMessage, status, connect, disconnect } = useConnectionStore()
    const canvasRef = useAudioWaveform()

    const handleClick = async () => {

        if (status == 'connected') {
            disconnect()

            stop();

            setOnAudioChunk(undefined)
        } else {
            connect()

            setOnAudioChunk((audioData) => {
                sendMessage({ type: 'realtimeInput', audioData })
            })

            await start();
        }
    }

    useEffect(() => {
        loadDevices()
    }, [])

    return (
        <div className="size-full flex flex-col items-center justify-center p-2 rounded-xl bg-muted gap-4">

            <canvas ref={canvasRef} height={80} className="w-full" />

            <div className="flex items-center gap-4">
                {
                    isRecording && status == 'connected' &&
                    <Button onClick={toggleMute} variant={'secondary'} className="p-0 size-10 rounded-full">
                        {isMuted ? <MicOffIcon className="size-5" /> : <MicIcon className="size-5" />}
                    </Button>
                }

                <Button
                    onClick={handleClick}
                    variant={isRecording && status == 'connected' ? 'destructive' : 'default'}
                    className="p-0 size-15 rounded-full cursor-pointer shadow-2xl"
                >
                    {isRecording && status == 'connected' ? <BotOffIcon className="size-5" /> : <AudioWaveformIcon className="size-5" />}
                </Button>
            </div>

            {
                !!availableDevices.length &&
                <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                    <SelectTrigger className="w-45">
                        <SelectValue placeholder="Audio Source" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {availableDevices.map((d, i) => (
                                <SelectItem key={i} value={d.deviceId}>{d.label}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            }
        </div>
    )
}

export default RecorderBox