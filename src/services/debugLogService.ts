// src/services/debugLogService.ts

/**
 * 簡單的除錯日誌函數。
 * 根據類型輸出日誌到控制台，可選擇包含額外數據。
 * @param type 日誌類型 ('info', 'warn', 'error', 'debug')
 * @param message 要輸出的訊息
 * @param data 可選的額外數據，將會被 JSON 序列化
 */
export function addDebugLog(
  type: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: any
) {
  const timestamp = new Date().toLocaleTimeString() // 獲取當前時間
  let logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`

  if (data) {
    try {
      // 嘗試將數據轉換為 JSON 字串，以方便查看複雜物件
      logMessage += ` - Data: ${JSON.stringify(data)}`
    } catch (e) {
      // 如果數據無法 JSON 序列化，則直接顯示
      logMessage += ` - Data: ${data}`
      console.error(`[addDebugLog] 無法序列化日誌數據: ${e}`)
    }
  }

  // 根據日誌類型使用不同的 console 方法
  switch (type) {
    case 'info':
      console.info(logMessage)
      break
    case 'warn':
      console.warn(logMessage)
      break
    case 'error':
      console.error(logMessage)
      break
    case 'debug':
      console.debug(logMessage)
      break
    default:
      console.log(logMessage) // 預設使用 console.log
  }
}
