import { create } from "zustand"

export type AnimationKey = 'fade' | 'slide' | 'scale' | 'none'

type DesignStoreType = {
  font: string
  background: string
  animation: AnimationKey
  update: (d: Partial<DesignStoreType>) => void
}

export const ANIMATIONS: AnimationKey[] = ['fade', 'slide', 'scale' , 'none']

export const FONTS = ['geist', 'bebas', 'libre-baskerville']

export const BACKGROUNDS = [
  './backgrounds/images/blob-scene.png',
  './backgrounds/images/blob.png',
  './backgrounds/images/circle-scatter.png',
  './backgrounds/images/layered-steps.png',
  './backgrounds/images/stacked-waves.png',
  './backgrounds/images/wave.png',
]

const useDesignStore = create<DesignStoreType>((set) => ({
  font: FONTS[0],
  background: BACKGROUNDS[0],
  animation: 'fade',
  update: (d) => set(d),
}))

export default useDesignStore