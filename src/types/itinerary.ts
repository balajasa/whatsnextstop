// types/IItinerary.ts

export interface InfoSection {
  id: string
  name: string
  class: string
  images: Array<{
    src: string
    alt: string
  }>
  iframe?: {
    src: string
    title?: string
    width?: string
    height?: string
    frameborder?: string
    allowfullscreen?: boolean
  }
}
