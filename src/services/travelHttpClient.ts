// services/travelHttpClient.ts
import axios, { AxiosResponse, AxiosError } from 'axios'

export class travelHttpClient {
  // true: 本機 | false: 線上
  private static isDev = false
  private static localUrl = '/api/usagi'
  private static prodUrl = 'https://raw.githubusercontent.com/balajasa/coffeeisadog/main'

  // 創建 axios 實例
  private static instance = axios.create({
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  static get baseUrl(): string {
    return this.isDev ? this.localUrl : this.prodUrl
  }

  static async get<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.get(`${this.baseUrl}${url}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  static async post<T>(url: string, data: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.post(`${this.baseUrl}${url}`, data)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 統一錯誤處理
   */
  private static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError

      if (axiosError.response) {
        // 伺服器回應錯誤
        const status = axiosError.response.status
        return new Error(`HTTP ${status}: 載入失敗`)
      } else if (axiosError.request) {
        // 請求發送失敗
        if (axiosError.code === 'ECONNABORTED') {
          return new Error('請求超時')
        }
        return new Error('網路連線失敗')
      } else {
        // 請求設定錯誤
        return new Error(`請求設定錯誤: ${axiosError.message}`)
      }
    }

    return new Error('載入失敗')
  }

  static getConfig() {
    return {
      isDev: this.isDev,
      baseUrl: this.baseUrl
    }
  }

  /**
   * 切換環境（開發用）
   */
  static setDevelopmentMode(isDev: boolean): void {
    this.isDev = isDev
  }

  /**
   * 設定超時時間
   */
  static setTimeout(timeout: number): void {
    this.instance.defaults.timeout = timeout
  }

  /**
   * 取得 axios 實例（進階使用）
   */
  static getInstance() {
    return this.instance
  }
}
