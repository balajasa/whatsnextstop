// ===================================
// 窗外天色：看瀏覽者所在地的時間
// 瀏覽者時區在對照表裡 → 用那裡當天的日出日落；不在 → 固定時段
// ===================================

import { TIMEZONE_COORDS } from '@/constants/tripWindow'

export type Sky = 'dawn' | 'day' | 'dusk' | 'night'

const HOUR = 3600000
const RAD = Math.PI / 180

/** 當天的日出、日落（毫秒）；極夜、永晝回傳字串 */
const sunTimes = (now: Date, lat: number, lng: number): { rise: number; set: number } | 'polar-night' | 'midnight-sun' => {
  // 日出方程式（NOAA 簡化版），誤差一兩分鐘，換天色夠用
  const julian = now.getTime() / 86400000 + 2440587.5
  const n = Math.ceil(julian - 2451545 + 0.0008)
  const meanSolarTime = n - lng / 360
  const anomaly = (357.5291 + 0.98560028 * meanSolarTime) % 360
  const center =
    1.9148 * Math.sin(anomaly * RAD) + 0.02 * Math.sin(2 * anomaly * RAD) + 0.0003 * Math.sin(3 * anomaly * RAD)
  const longitude = (anomaly + center + 180 + 102.9372) % 360
  const transit = 2451545 + meanSolarTime + 0.0053 * Math.sin(anomaly * RAD) - 0.0069 * Math.sin(2 * longitude * RAD)
  const declination = Math.asin(Math.sin(longitude * RAD) * Math.sin(23.4397 * RAD))
  const cosHourAngle =
    (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * Math.sin(declination)) / (Math.cos(lat * RAD) * Math.cos(declination))
  if (cosHourAngle > 1) return 'polar-night'
  if (cosHourAngle < -1) return 'midnight-sun'
  const hourAngle = Math.acos(cosHourAngle) / RAD
  const toMs = (j: number): number => (j - 2440587.5) * 86400000
  return { rise: toMs(transit - hourAngle / 360), set: toMs(transit + hourAngle / 360) }
}

/** 對照表沒有的時區：清晨 5–7、白天 7–17、黃昏 17–19、其他夜晚 */
const skyByHour = (hour: number): Sky => {
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 17) return 'day'
  if (hour >= 17 && hour < 19) return 'dusk'
  return 'night'
}

/** 有座標：日出前後一小時是清晨、日落前後一小時是黃昏，中間白天，其他夜晚 */
export const getSky = (now: Date = new Date()): Sky => {
  let timeZone = ''
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    // 拿不到時區就用固定時段
  }
  const coords = TIMEZONE_COORDS[timeZone]
  if (!coords) return skyByHour(now.getHours())

  const sun = sunTimes(now, coords[0], coords[1])
  if (sun === 'polar-night') return 'night'
  if (sun === 'midnight-sun') return 'day'
  const time = now.getTime()
  if (Math.abs(time - sun.rise) < HOUR) return 'dawn'
  if (Math.abs(time - sun.set) < HOUR) return 'dusk'
  if (time > sun.rise && time < sun.set) return 'day'
  return 'night'
}
