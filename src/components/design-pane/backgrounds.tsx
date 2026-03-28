import useDesignStore, { BACKGROUNDS } from "@/lib/design"
import { cn } from "@/lib/utils"


const DesignPaneBackgrounds = () => {

    const { background, update } = useDesignStore()

    const handleChangeBackground = (background: string) => {
        update({ background })

        window.ipcRenderer.send("message:projector", { type: 'CHANGE_BACKGROUND', background })
    }

    return (
        <div className="size-full overflow-auto space-y-2">
            {BACKGROUNDS.map((b, i) => (
                <div 
                key={i}
                onClick={() => handleChangeBackground(b)}
                className={cn(
                    "flex items-center justify-center aspect-video rounded-xl overflow-hidden transition-all",
                    { "border-4 border-primary p-2" : background == b }
                )}>
                    <img src={b} alt={b} className="size-full object-cover" />
                </div>
            ))}
        </div>
    )
}

export default DesignPaneBackgrounds