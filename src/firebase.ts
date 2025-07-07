// src/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'
import { getAuth, Auth } from 'firebase/auth'

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

// 你的 Firebase 設定（替換成你剛才複製的）
const firebaseConfig: FirebaseConfig = {
  apiKey: 'AIzaSyAt4LoW66f3eS_sQlxx7EqVm1lspJac3Jg',
  authDomain: 'pack-panda.firebaseapp.com',
  databaseURL: 'https://pack-panda-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'pack-panda',
  storageBucket: 'pack-panda.firebasestorage.app',
  messagingSenderId: '6487250876',
  appId: '1:6487250876:web:35c42975b5967be6c7fdb9'
}

// 初始化 Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)

// 初始化服務
export const database: Database = getDatabase(app)
export const auth: Auth = getAuth(app)
