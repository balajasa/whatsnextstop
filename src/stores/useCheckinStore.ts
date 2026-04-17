import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchCheckins, createCheckin, uploadPhoto, fetchLocationName } from '@/services/checkin/checkinService'
import type { Checkin, CheckinFormData } from '@/types/checkin/checkin'

export const useCheckinStore = defineStore('checkin', () => {
  const checkins = ref<Checkin[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  async function loadCheckins() {
    isLoading.value = true
    error.value = null
    try {
      checkins.value = await fetchCheckins()
    } catch (e) {
      error.value = '載入打卡記錄失敗'
    } finally {
      isLoading.value = false
    }
  }

  async function submitCheckin(form: CheckinFormData) {
    if (!form.photo) throw new Error('請選擇照片')
    if (form.lat === null || form.lng === null) throw new Error('無法取得定位')

    isSubmitting.value = true
    error.value = null
    try {
      const photoURL = await uploadPhoto(form.photo)
      const locationName = form.locationName || await fetchLocationName(form.lat, form.lng)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      await createCheckin({
        photoURL,
        lat: form.lat,
        lng: form.lng,
        locationName,
        timezone,
        message: form.message,
        hashtags: form.hashtags,
      })
      await loadCheckins()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '打卡失敗'
      throw e
    } finally {
      isSubmitting.value = false
    }
  }

  return { checkins, isLoading, isSubmitting, error, loadCheckins, submitCheckin }
})
