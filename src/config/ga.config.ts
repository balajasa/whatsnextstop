/**
 * Google Analytics 設定檔
 */

export const GA_IDS = {
  development: 'G-WNYZCXVE5H',
  production: 'G-CE53S045GX'
} as const

/**
 * 根據當前環境取得對應的 GA ID
 */
export const getGaId = (): string => {
  const mode = import.meta.env.MODE
  return GA_IDS[mode as keyof typeof GA_IDS] || GA_IDS.production
}
