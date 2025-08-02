// ===================================
// src/utils/dateUtils.ts
// 日期相關工具函數
// ===================================

import type { CountdownData } from '../types/travel-countdown'

/**
 * 驗證日期字串格式 (ISO 8601)
 * @param dateString - 日期字串，例如 '2026-12-25'
 * @returns 是否為有效的日期格式
 */
export function isValidDateString(dateString: string): boolean {
  // 檢查基本格式 YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) {
    return false
  }

  // 檢查是否能正確解析為日期
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && date.toISOString().startsWith(dateString)
}

/**
 * 計算兩個日期之間的天數差
 * @param fromDate - 起始日期
 * @param toDate - 結束日期
 * @returns 天數差（可為負數）
 */
export function getDaysDifference(fromDate: Date, toDate: Date): number {
  const diffMs = toDate.getTime() - fromDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * 計算倒數資料
 * @param tripDate - 旅行日期字串 (ISO 8601)
 * @param planningStartDate - 開始規劃日期 (可選，預設為一年前)
 * @returns 倒數資料物件
 */
export function calculateCountdown(tripDate: string, planningStartDate?: Date): CountdownData {
  // 驗證日期格式
  if (!isValidDateString(tripDate)) {
    throw new Error(`無效的日期格式: ${tripDate}`)
  }

  const now = new Date()
  const trip = new Date(tripDate)
  const diffMs = trip.getTime() - now.getTime()

  // 如果已經過期，回傳零值
  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      progress: 100
    }
  }

  // 計算各時間單位
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  // 計算總天數
  const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  // 計算進度百分比
  const startDate =
    planningStartDate ||
    (() => {
      const oneYearAgo = new Date(trip)
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      return oneYearAgo
    })()

  const totalPlanningMs = trip.getTime() - startDate.getTime()
  const elapsedMs = now.getTime() - startDate.getTime()
  const progress = Math.min(100, Math.max(0, (elapsedMs / totalPlanningMs) * 100))

  return {
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    progress: Math.round(progress)
  }
}

/**
 * 格式化日期為可讀格式
 * @param date - 日期物件或日期字串
 * @param locale - 語言設定，預設為 'zh-TW'
 * @returns 格式化後的日期字串
 */
export function formatDate(date: Date | string, locale: string = 'zh-TW'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    throw new Error('無效的日期')
  }

  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

/**
 * 格式化倒數時間為可讀文字
 * @param countdown - 倒數資料
 * @param showSeconds - 是否顯示秒數，預設為 true
 * @returns 格式化後的倒數文字
 */
export function formatCountdownText(countdown: CountdownData, showSeconds: boolean = true): string {
  const { days, hours, minutes, seconds } = countdown

  if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
    return '旅行時間到了！'
  }

  const parts: string[] = []

  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小時`)
  if (minutes > 0) parts.push(`${minutes}分鐘`)
  if (showSeconds && seconds > 0) parts.push(`${seconds}秒`)

  return parts.join(' ')
}

/**
 * 檢查日期是否在未來
 * @param dateString - 日期字串
 * @returns 是否為未來日期
 */
export function isFutureDate(dateString: string): boolean {
  if (!isValidDateString(dateString)) {
    return false
  }

  const date = new Date(dateString)
  const now = new Date()

  return date.getTime() > now.getTime()
}

/**
 * 取得相對時間描述
 * @param dateString - 日期字串
 * @returns 相對時間描述，例如 "3個月後"
 */
export function getRelativeTimeDescription(dateString: string): string {
  if (!isValidDateString(dateString)) {
    return '無效日期'
  }

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()

  if (diffMs <= 0) {
    return '已過期'
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (days < 7) {
    return `${days}天後`
  } else if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks}週後`
  } else if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months}個月後`
  } else {
    const years = Math.floor(days / 365)
    const remainingMonths = Math.floor((days % 365) / 30)
    return remainingMonths > 0 ? `${years}年${remainingMonths}個月後` : `${years}年後`
  }
}

/**
 * 計算旅行倒數的里程碑
 * @param tripDate - 旅行日期
 * @returns 里程碑物件
 */
export function getTripMilestones(tripDate: string) {
  if (!isValidDateString(tripDate)) {
    throw new Error('無效的日期格式')
  }

  const trip = new Date(tripDate)
  const now = new Date()
  const daysLeft = getDaysDifference(now, trip)

  return {
    isLastMonth: daysLeft <= 30 && daysLeft > 0,
    isLastWeek: daysLeft <= 7 && daysLeft > 0,
    isLastDay: daysLeft === 1,
    isTripDay: daysLeft === 0,
    isPastDue: daysLeft < 0,
    urgencyLevel: daysLeft <= 7 ? 'high' : daysLeft <= 30 ? 'medium' : 'low'
  }
}

/**
 * 格式化日期範圍
 * @param startDate 開始日期 (MM-DD)
 * @param endDate 結束日期 (MM-DD)
 * @returns 格式化後的日期範圍字符串
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const formattedStart = startDate.replace('-', '/')
  const formattedEnd = endDate.replace('-', '/')
  return `${formattedStart} - ${formattedEnd}`
}

/**
 * 計算旅行天數
 * @param startDate 開始日期 (MM-DD)
 * @param endDate 結束日期 (MM-DD)
 * @param year 年份，默認為2024
 * @returns 旅行天數
 */
export function calculateDays(startDate: string, endDate: string, year: number = 2024): number {
  const [startMonth, startDay] = startDate.split('-').map(Number)
  const [endMonth, endDay] = endDate.split('-').map(Number)

  const start = new Date(year, startMonth - 1, startDay)
  const end = new Date(year, endMonth - 1, endDay)

  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}
