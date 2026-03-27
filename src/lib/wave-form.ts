import { useEffect, useRef } from 'react'
import { useRecordingStore } from './recording'

export function useAudioWaveform() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rafRef = useRef<number>()
    const audioCtxRef = useRef<AudioContext>()
    const mediaStream = useRecordingStore(s => s.mediaStream)
    const isRecording = useRecordingStore(s => s.isRecording)
    const isMuted = useRecordingStore(s => s.isMuted)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!

        const drawBars = (getValue: (i: number, half: number) => number) => {
            canvas.width = canvas.offsetWidth
            const { width: W, height: H } = canvas
            ctx.clearRect(0, 0, W, H)
            const bars = 80
            const barW = W / bars - 2
            const half = bars / 2
            for (let i = 0; i < bars; i++) {
                const mirrored = i < half ? half - i - 1 : i - half
                const v = getValue(mirrored, half)
                const h = Math.max(3, v * H * 0.85)
                const lightness = 0.269 + v * 0.55
                ctx.fillStyle = `oklch(${lightness.toFixed(3)} 0 0)`
                ctx.beginPath()
                ctx.roundRect(i * (barW + 2) + 1, (H - h) / 2, barW, h, 2)
                ctx.fill()
            }
        }

        if (!mediaStream || !isRecording) {
            let t = 0
            const tick = () => {
                drawBars((i) => 0.08 + 0.07 * Math.sin(t * 2 + i * 0.4))
                t += 0.04
                rafRef.current = requestAnimationFrame(tick)
            }
            tick()
            return () => cancelAnimationFrame(rafRef.current!)
        }

        audioCtxRef.current = new AudioContext()
        const analyser = audioCtxRef.current.createAnalyser()
        analyser.fftSize = 256
        audioCtxRef.current.createMediaStreamSource(mediaStream).connect(analyser)
        const buf = new Uint8Array(analyser.frequencyBinCount)

        const tick = () => {
            analyser.getByteFrequencyData(buf)
            drawBars((i, half) =>
                isMuted ? 0 : buf[Math.floor(i * buf.length / half)] / 255
            )
            rafRef.current = requestAnimationFrame(tick)
        }
        tick()

        return () => {
            cancelAnimationFrame(rafRef.current!)
            audioCtxRef.current?.close()
        }
    }, [mediaStream, isRecording, isMuted])

    return canvasRef
}