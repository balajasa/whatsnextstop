declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration) => void
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegisterError?: (error: unknown) => void
  }): (reloadPage?: boolean) => Promise<void>
}