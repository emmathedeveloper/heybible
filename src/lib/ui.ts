import { create } from 'zustand'

type UIStore = {
  transcript: string
  appendTranscript: (text: string) => void
  clearTranscript: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  transcript: '',
  appendTranscript: (text) => set((s) => ({ transcript: s.transcript + text })),
  clearTranscript: () => set({ transcript: '' }),
}))