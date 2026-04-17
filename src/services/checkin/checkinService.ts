import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import type { Checkin } from '@/types/checkin/checkin'

const COLLECTION_NAME = 'checkins_sp'
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Cloudinary 圖片最佳化 URL（縮小尺寸、自動格式與品質）
 */
export function optimizeImageUrl(url: string, width = 800): string {
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`)
}

/**
 * 用經緯度取得地址（BigDataCloud）
 */
export async function fetchLocationName(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`
  )
  if (!res.ok) return ''
  const data = await res.json()
  const parts = [data.countryName, data.principalSubdivision, data.city, data.locality].filter(Boolean)
  return parts.join(' ')
}

/**
 * 上傳照片到 Cloudinary
 */
export async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'herenow')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    console.error('Cloudinary 上傳失敗', res.status, errData)
    throw new Error('照片上傳失敗')
  }

  const data = await res.json()
  console.log('Cloudinary 上傳成功', data.secure_url)
  return data.secure_url as string
}

/**
 * 新增一筆打卡記錄到 Firestore
 */
export async function createCheckin(payload: {
  photoURL: string
  lat: number
  lng: number
  locationName: string
  locationAddress: string
  timezone: string
  message: string
  hashtags: string[]
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...payload,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

/**
 * 取得所有打卡記錄（依時間降序）
 */
export async function fetchCheckins(): Promise<Checkin[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      photoURL: data.photoURL,
      lat: data.lat,
      lng: data.lng,
      locationName: data.locationName ?? '',
      locationAddress: data.locationAddress ?? '',
      timezone: data.timezone ?? 'Asia/Taipei',
      message: data.message ?? '',
      hashtags: data.hashtags ?? [],
      createdAt: (data.createdAt as Timestamp).toDate(),
    }
  })
}