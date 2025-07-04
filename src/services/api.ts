// services/api.ts
export class ApiService {
  private static isDev = true
  private static localUrl = '/api/usagi'
  private static prodUrl = 'https://raw.githubusercontent.com/balajasa/coffeeisadog/main'

  static get baseUrl(): string {
    return this.isDev ? this.localUrl : this.prodUrl
  }

  static async get<T>(url: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: 載入失敗`)
    }
    return response.json()
  }

  static async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: 載入失敗`)
    }
    return response.json()
  }

  static getConfig() {
    return {
      isDev: this.isDev,
      baseUrl: this.baseUrl
    }
  }
}