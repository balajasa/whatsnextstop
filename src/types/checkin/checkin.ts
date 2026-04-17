export interface Checkin {
  id: string
  photoURL: string
  lat: number
  lng: number
  locationName: string
  timezone: string
  message: string
  hashtags: string[]
  createdAt: Date
}

export interface CheckinFormData {
  message: string
  hashtags: string[]
  lat: number | null
  lng: number | null
  locationName: string
  timezone: string
  photo: File | null
}
