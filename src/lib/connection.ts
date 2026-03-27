import { create } from 'zustand'
import { useUIStore } from './ui'
import useBibleStore from './bible'
import { useRecordingStore } from './recording'

type ConnectionStore = {
  socket: WebSocket | null
  status: 'connected' | 'disconnected'
  connect: () => void
  disconnect: () => void
  sendMessage: (data: object) => void
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  socket: null,
  status: 'disconnected',

  connect: () => {
    const socket = new WebSocket('wss://heybible-server-jzxz.onrender.com/ws')

    socket.onopen = () => {
      set({ status: 'connected' })
      window.ipcRenderer.send("open-projector")
    }
    socket.onclose = () => {
      set({ status: 'disconnected' })
      useRecordingStore.getState().stop()
      window.ipcRenderer.send("close-projector")
    }
    socket.onerror = () => {
      set({ status: 'disconnected' })
      useRecordingStore.getState().stop()
      window.ipcRenderer.send("close-projector")
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)

      if (message.type === 'textStream') {
        useUIStore.getState().appendTranscript(message.data)
      }

      if (message.type == 'close' || message.type == 'error') {
        window.ipcRenderer.send("close-projector")
      }

      if (message.type == "toolCall") {
        const { name, data } = message

        switch (name) {
          case 'get_bible_passage':
            console.log(data)
            useBibleStore.getState().getBiblePassage(data.book, data.chapter, data.verse).then(verse => {
              window.ipcRenderer.send('message:projector', { type: 'DISPLAY_VERSE', verse })
            })
            break

          case 'navigate_to_verse':
            console.log(data)
            useBibleStore.getState().navigateToVerse(data.direction, data.steps, data.target_verse).then(verse => {
              window.ipcRenderer.send('message:projector', { type: 'DISPLAY_VERSE', verse })
            })
            break

          case 'set_bible_version':
            console.log(data)
            useBibleStore.getState().setBibleVersion(data.version)
            break
        }
      }


    }

    set({ socket })
  },

  disconnect: () => {
    get().socket?.close()
    set({ socket: null, status: 'disconnected' })
  },

  sendMessage: (data) => {
    const { socket } = get()
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data))
    }
  },
}))