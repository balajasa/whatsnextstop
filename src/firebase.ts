// src/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'
import { getAuth, Auth } from 'firebase/auth'

const env = import.meta.env

// Firebase 設定介面
interface FirebaseConfig {
  apiKey: string
  authDomain: string
  databaseURL: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// const firebaseConfig: FirebaseConfig = {
//   apiKey: env.VITE_FIREBASE_API_KEY,
//   authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
//   databaseURL: env.VITE_FIREBASE_DATABASE_URL,
//   projectId: env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: env.VITE_FIREBASE_APP_ID
// }
const firebaseConfig: FirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain:
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `localhost:${window.location.port || '5173'}` // 在本地時指向本地伺服器
      : 'balajasa.github.io', // 部署到 GitHub Pages 時指向 GitHub Pages 網域
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
}

// 初始化 Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)

// 初始化服務
export const database: Database = getDatabase(app)
export const auth: Auth = getAuth(app)
