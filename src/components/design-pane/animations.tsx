import useDesignStore, { AnimationKey, ANIMATIONS } from "@/lib/design"
import { cn } from "@/lib/utils"
import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

type AnimationOptions = {
    preview?: boolean
}

export const ANIMATIONS_MAP: Record<AnimationKey, (targets: HTMLElement[], options?: AnimationOptions) => void> = {
    fade: (targets, { preview } = {}) =>
        gsap.fromTo(targets,
            { opacity: 0 },
            { opacity: 1, duration: 0.8, stagger: preview ? 0 : 0.15, ease: 'power2.out', repeat: preview ? -1 : 0, yoyo: preview }
        ),
    slide: (targets, { preview } = {}) =>
        gsap.fromTo(targets,
            { opacity: 0, y: preview ? 12 : 24 },
            { opacity: 1, y: 0, duration: 0.6, stagger: preview ? 0 : 0.15, ease: 'power3.out', repeat: preview ? -1 : 0, yoyo: preview }
        ),
    scale: (targets, { preview } = {}) =>
        gsap.fromTo(targets,
            { opacity: 0, scale: preview ? 0.88 : 0.92 },
            { opacity: 1, scale: 1, duration: 0.7, stagger: preview ? 0 : 0.15, ease: 'back.out(1.4)', repeat: preview ? -1 : 0, yoyo: preview }
        ),
    none: (targets) =>
        gsap.set(targets, { opacity: 1 }),
}

const AnimationCard = ({ name }: { name: keyof typeof ANIMATIONS_MAP }) => {
    const { animation, update } = useDesignStore()
    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLHeadingElement>(null)

    useGSAP(() => {
        if (!textRef.current) return
        ANIMATIONS_MAP[name]([textRef.current], { preview: true })
    }, { scope: containerRef, dependencies: [name] })

    const handleSelect = () => {
        update({ animation: name })
        window.ipcRenderer.send("message:projector", { type: 'CHANGE_ANIMATION', animation: name })
    }

    return (
        <div
            ref={containerRef}
            onClick={handleSelect}
            className={cn(
                "flex items-center justify-center aspect-video rounded-xl overflow-hidden transition-all bg-secondary select-none cursor-pointer",
                { "border-4 border-primary p-2": animation === name }
            )}
        >
            <h1 ref={textRef} className="verse text-sm">{name}</h1>
        </div>
    )
}

const DesignPaneAnimations = () => {
    return (
        <div className="size-full overflow-auto space-y-2">
            {ANIMATIONS.map((a) => (
                <AnimationCard key={a} name={a} />
            ))}
        </div>
    )
}

export default DesignPaneAnimations