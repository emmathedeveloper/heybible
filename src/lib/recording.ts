import { create } from 'zustand'

type RecordingStore = {
  isRecording: boolean
  isMuted: boolean
  mediaStream: MediaStream | null
  source: MediaStreamAudioSourceNode | null
  selectedDeviceId: string
  availableDevices: MediaDeviceInfo[]
  setSelectedDeviceId: (id: string) => void
  loadDevices: () => Promise<void>
  start: () => Promise<void>
  stop: () => void
  toggleMute: () => void
  onAudioChunk?: (base64: string) => void
  setOnAudioChunk: (cb: ((base64: string) => void) | undefined) => void
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  isRecording: false,
  isMuted: false,
  mediaStream: null,
  source: null,
  selectedDeviceId: '',
  availableDevices: [],
  onAudioChunk: undefined,

  setOnAudioChunk: (cb) => set({ onAudioChunk: cb }),

  setSelectedDeviceId: (id) => set({ selectedDeviceId: id }),

  loadDevices: async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter((d) => d.kind === 'audioinput')
      set({ availableDevices: audioInputs })
      if (audioInputs.length > 0 && !get().selectedDeviceId) {
        set({ selectedDeviceId: audioInputs[0].deviceId })
      }
    } catch (error) {
      console.error('Error enumerating devices:', error)
    }
  },

  start: async () => {
    const { selectedDeviceId, onAudioChunk } = get()
    const constraints = {
      audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    const audioContext = new AudioContext({ sampleRate: 16000 })
    const source = audioContext.createMediaStreamSource(stream)

    const workletName = 'audio-recorder-worklet'
    const workletCode = `
      class AudioProcessingWorklet extends AudioWorkletProcessor {
        buffer = new Int16Array(512);
        bufferWriteIndex = 0;
        process(inputs) {
          if (inputs[0].length) this.processChunk(inputs[0][0]);
          return true;
        }
        sendAndClearBuffer() {
          this.port.postMessage({ event: 'chunk', data: { int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer } });
          this.bufferWriteIndex = 0;
        }
        processChunk(float32Array) {
          for (let i = 0; i < float32Array.length; i++) {
            this.buffer[this.bufferWriteIndex++] = float32Array[i] * 32768;
            if (this.bufferWriteIndex >= this.buffer.length) this.sendAndClearBuffer();
          }
          if (this.bufferWriteIndex >= this.buffer.length) this.sendAndClearBuffer();
        }
      }
    `
    const blob = new Blob([`registerProcessor("${workletName}", ${workletCode})`], {
      type: 'application/javascript',
    })
    await audioContext.audioWorklet.addModule(URL.createObjectURL(blob))

    const workletNode = new AudioWorkletNode(audioContext, workletName)
    workletNode.port.onmessage = (ev) => {
      const buffer = ev.data.data.int16arrayBuffer
      if (buffer) {
        onAudioChunk?.(arrayBufferToBase64(buffer))
      }
    }

    source.connect(workletNode)
    set({ isRecording: true, mediaStream: stream, source })
  },

  stop: () => {
    const { mediaStream, source } = get()
    source?.disconnect()
    mediaStream?.getTracks().forEach((t) => t.stop())
    set({ isRecording: false, isMuted: false, mediaStream: null, source: null })
  },

  toggleMute: () => {
    const { mediaStream, isMuted } = get()
    if (!mediaStream) return
    const track = mediaStream.getAudioTracks()[0]
    const next = !isMuted
    track.enabled = !next
    set({ isMuted: next })
  },
}))