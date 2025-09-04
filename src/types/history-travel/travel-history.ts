// ===================================
// 歷史旅程資料型別
// ===================================

export interface HistoryTripDestination {
  country: string
  cities: string[]
}

export interface HistoryTripDate {
  startDate: string
  endDate: string
}

export interface HistoryTrip {
  id?: string
  title: string
  folderName: string
  date: HistoryTripDate
  destinations: HistoryTripDestination[]
  createdAt?: string
}

