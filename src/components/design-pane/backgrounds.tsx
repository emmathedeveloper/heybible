import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"


const BACKGROUNDS = [
    './backgrounds/images/blob-scene.png',
    './backgrounds/images/blob.png',
    './backgrounds/images/circle-scatter.png',
    './backgrounds/images/layered-steps.png',
    './backgrounds/images/stacked-waves.png',
    './backgrounds/images/wave.png',
]

const DesignPaneBackgrounds = () => {

    const [activeBackground, setActiveBackground] = useState<string>(BACKGROUNDS[0])

    useEffect(() => {
        if(activeBackground){
            window.ipcRenderer.send("message:projector" , { type: 'CHANGE_BACKGROUND' , background: activeBackground })
        }
    } , [activeBackground])

    return (
        <div className="size-full overflow-auto space-y-2">
            {BACKGROUNDS.map((b, i) => (
                <div 
                key={i}
                onClick={() => setActiveBackground(b)}
                className={cn(
                    "flex items-center justify-center aspect-video rounded-xl overflow-hidden transition-all",
                    { "border-4 border-primary p-2" : activeBackground == b }
                )}>
                    <img src={b} alt={b} className="size-full object-cover" />
                </div>
            ))}
        </div>
    )
}

export default DesignPaneBackgrounds