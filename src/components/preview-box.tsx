import { useConnectionStore } from "@/lib/connection"
import { useEffect, useRef, useState } from "react"
import { VideoOffIcon } from "lucide-react"

const PreviewBox = () => {
    const { status } = useConnectionStore()
    const [isStreaming, setIsStreaming] = useState(false)

    const previewTimerRef = useRef<any>()
    const videoElRef = useRef<HTMLVideoElement | null>(null)

    const setUpPreview = async () => {

        setIsStreaming(true)

        navigator.mediaDevices.getDisplayMedia({
            audio: false,
            video: {
                width: 1920,
                height: 1080,
            }
        }).then(stream => {
            if (videoElRef.current) {
                videoElRef.current.srcObject = stream;
    
                videoElRef.current.play()
            }
        }).catch(e => console.log(e))

    }

    //Start streaming the projector window once the session has started.
    //3 second delay to ensure the projector has loaded
    useEffect(() => {
        clearTimeout(previewTimerRef.current)

        console.log(status)

        if (status == 'connected') {

            previewTimerRef.current = setTimeout(() => {
                setUpPreview()
            }, 3000)
        } else {
            setIsStreaming(false)
        }
    }, [status])

    return (
        <div className="size-full flex flex-col items-center justify-center gap-4 text-muted aspect-video">
            {
                isStreaming ?
                    <video ref={videoElRef} controls={false} className="size-full"></video>
                    :
                    <>
                        <VideoOffIcon className="size-20"/>
                        <h1 className="text-3xl font-black">Not Active Yet</h1>
                        <p className="text-center">You haven't started a session. Preview will be available once you do</p>
                    </>
            }
        </div>
    )
}

export default PreviewBox