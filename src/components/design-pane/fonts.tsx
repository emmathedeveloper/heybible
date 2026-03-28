import useDesignStore, { FONTS } from "@/lib/design"
import { cn } from "@/lib/utils"

const DesignPaneFonts = () => {

    const { font, update } = useDesignStore()

    const handleChangeFont = (font: string) => {
        update({ font })

        window.ipcRenderer.send("message:projector", { type: 'CHANGE_FONT', font })
    }

    return (
        <div className="size-full overflow-auto space-y-2">
            {FONTS.map((f, i) => (
                <div
                    key={i}
                    onClick={() => handleChangeFont(f)}
                    className={cn(
                        "flex items-center justify-center aspect-video rounded-xl overflow-hidden transition-all bg-secondary select-none cursor-pointer",
                        { "border-4 border-primary p-2": font == f }
                    )}>
                    <h1 data-font={f} className="verse">{f}</h1>
                </div>
            ))}
        </div>
    )
}

export default DesignPaneFonts