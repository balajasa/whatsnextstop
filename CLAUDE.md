# 專案描述
這是「What's Next Stop」- 一個個人旅遊前台網站，專注於旅行規劃、行程展示和互動體驗。

## 🏗️ 專案架構說明
- **前台網站**：「What's Next Stop」- 當前專案，用戶使用的旅遊網站（Vue 3 + TypeScript + Vite）
- **後台管理系統**：「Gengar Travel Planner」- 管理旅行資料的後台系統
- **資料庫服務**：API 服務和本地資料存儲

## 🔄 資料流向
本地/API 資料 → 前台顯示和互動

## 📋 用語定義
為避免混淆，請使用以下明確用語：
- **前台** = 「What's Next Stop」用戶網站（當前專案）
- **後台** = 「Gengar Travel Planner」管理系統
- **資料服務** = API 服務和本地資料管理

## 🚀 專案概覽
- **專案名稱**: What's Next Stop
- **技術棧**: Vue 3 + TypeScript + Vite + Pinia + SASS + D3.js + GSAP + Swiper
- **主要功能**: 旅行規劃展示、互動地圖、小遊戲、行程管理、拍照功能

## 📁 專案結構
```
src/
├── assets/
│   └── img/         # 圖片資源
│       ├── bg/      # 背景圖片（banner、遊戲背景）
│       ├── icon/    # 功能圖標
│       ├── itinerary/    # 行程相關圖片
│       ├── logo.png      # 網站 Logo
│       ├── minigame/     # 小遊戲素材
│       │   ├── cat/      # 貓咪角色素材
│       │   ├── icon/     # 遊戲圖標
│       │   ├── map/      # 地圖素材
│       │   └── stone/    # 石頭遊戲素材
│       ├── sym/          # 符號圖標
│       └── weather/      # 天氣圖標
├── components/      # 可重用組件
│   ├── cat-photo/         # 拍照功能組件
│   │   ├── CameraPage.vue     # 相機頁面
│   │   ├── ResultPage.vue     # 拍照結果頁面
│   │   └── FinalResultPage.vue # 最終結果頁面
│   ├── common/            # 通用組件
│   │   ├── BreadcrumbNav.vue  # 麵包屑導航
│   │   └── DialogProvider.vue # 對話框提供者
│   └── layout/            # 布局組件
│       ├── Footer.vue         # 頁腳
│       ├── MainContent.vue    # 主內容區域
│       ├── Sidebar.vue        # 側邊欄
│       └── TravelCountdown.vue # 旅行倒數計時
├── composables/     # Vue 組合式函數
│   ├── cat-photo/         # 拍照相關邏輯
│   ├── countryTranslation.ts  # 國家翻譯
│   ├── useDialog.ts       # 對話框邏輯
│   ├── useTravelList.ts   # 旅行列表邏輯
│   └── useTravelPhotos.ts # 旅行照片邏輯
├── constants/       # 常數配置
│   ├── catPhotoConfig.ts      # 拍照配置
│   ├── countryLocationConfig.ts # 國家位置配置
│   ├── countryNameTWConfig.ts # 國家中文名稱配置
│   ├── regionConfig.ts        # 地區配置
│   └── taskConfig.json        # 任務配置
├── router/          # 路由配置
│   └── index.ts             # 路由定義
├── services/        # API 服務
│   ├── geocodingService.ts  # 地理編碼服務
│   ├── travelHttpClient.ts  # 旅行 HTTP 客戶端
│   ├── travelService.ts     # 旅行服務
│   └── weatherService.ts    # 天氣服務
├── stores/          # Pinia 狀態管理
│   ├── catPhotoStore.ts         # 拍照狀態
│   ├── travelCountdownStore.ts  # 旅行倒數狀態
│   └── useTravelStore.ts        # 旅行狀態
├── styles/          # 全局樣式
│   ├── _mixins.sass         # SASS mixins
│   ├── _variables.sass      # SASS 變數
│   ├── index.sass           # 主樣式檔
│   └── reset.sass           # CSS 重置
├── types/           # TypeScript 類型定義
│   ├── cat-photo.ts         # 拍照相關類型
│   ├── dialog.ts            # 對話框類型
│   ├── itinerary.ts         # 行程類型
│   ├── layout.ts            # 布局類型
│   ├── minigame.ts          # 小遊戲類型
│   ├── response.ts          # API 響應類型
│   ├── travel-countdown.ts  # 旅行倒數類型
│   └── travel-map.ts        # 旅行地圖類型
├── utils/           # 工具函數
│   ├── dateUtils.ts         # 日期工具
│   ├── photoUtils.ts        # 照片工具
│   ├── regionUtils.ts       # 地區工具
│   └── travelUtils.ts       # 旅行工具
├── views/           # 頁面組件
│   ├── Home.vue             # 首頁布局
│   ├── games/               # 小遊戲頁面
│   │   ├── DropBlock.vue    # 從天而降遊戲
│   │   ├── FoodWheel.vue    # 濟州島輪盤遊戲
│   │   ├── MiniGame.vue     # 小遊戲導航
│   │   └── TakeMeTravel.vue # 帶我去旅行（拍照）
│   ├── itinerary/           # 行程相關頁面
│   │   ├── Itinerary.vue    # 行程總覽
│   │   └── ItineraryDetail.vue # 行程詳情
│   └── travel/              # 旅行相關頁面
│       ├── InfoPanel.vue    # 資訊面板
│       ├── MapPin.vue       # 地圖標記
│       ├── TravelMap.vue    # 旅行地圖
│       ├── TravelTrace.vue  # 旅行足跡
│       └── WorldMap.vue     # 世界地圖
└── main.ts          # 應用程式入口
```

## 🛠 開發命令
```bash
npm install         # 安裝依賴
npm run dev         # 啟動開發服務器
npm run build       # 建構生產版本
npm run preview     # 預覽生產版本
```

## 📱 功能模組
1. **首頁** (`/home`) - 主要功能導航和輪播展示
2. **行程規劃** (`/itinerary`) - 旅行行程總覽
3. **行程詳情** (`/itinerary-detail`) - 詳細行程資訊
4. **旅行地圖** (`/travelmap`) - 互動式世界地圖
5. **我的足跡** (`/travel-trace`) - 旅行軌跡記錄
6. **小遊戲區域**:
   - 從天而降 (`/dropblock`) - 掉落遊戲
   - 濟州島輪盤 (`/foodwheel`) - 轉盤遊戲
   - 帶我去旅行 (`/takemetravel`) - 拍照遊戲

## 🎮 特色功能
- **互動式地圖**: 使用 D3.js 製作的世界地圖
- **拍照功能**: 結合相機 API 的旅行拍照體驗
- **小遊戲**: 多種趣味小遊戲增加互動性
- **旅行倒數**: 動態倒數計時功能
- **響應式輪播**: 使用 Swiper 製作的圖片輪播

## 🎨 設計特色
- **響應式設計**: 支援桌面版、平板、手機版
- **統一設計語言**: 使用 SASS mixins 統一響應式斷點
- **主題色系**:
  - 主色調：藍色系 (primary)
  - 強調色：青色系 (accent-color-1)、橘色系 (accent-color-2)
  - 時間軸色：不同狀態對應不同顏色
- **動畫效果**: GSAP 驅動的流暢動畫
- **交互設計**: Hover 效果、過渡動畫、視覺反饋

## 🔧 技術細節
- **前端框架**: Vue 3 Composition API
- **類型系統**: TypeScript 完整支援
- **狀態管理**: Pinia 狀態管理
- **路由**: Vue Router 4 + hash 模式
- **樣式預處理**: SASS/SCSS
- **建構工具**: Vite
- **動畫庫**: GSAP（流暢動畫）
- **圖表庫**: D3.js（互動地圖）
- **輪播組件**: Swiper（圖片輪播）
- **程式碼品質**: ESLint + Prettier
- **工具庫**: Lodash + Axios

## 📊 數據結構
- **旅行資料**: 本地 JSON 配置和 API 服務
- **地理資料**: 國家位置、地區配置
- **任務配置**: JSON 檔案管理
- **類型定義**: 完整的 TypeScript interfaces
- **狀態管理**: Pinia stores 管理應用狀態

## 🧩 組件系統
- **基礎組件**: 麵包屑導航、對話框等
- **布局組件**: 側邊欄、頁腳、主內容區域
- **功能組件**: 拍照、地圖、遊戲等
- **組合式函數**: 業務邏輯復用

## 📸 拍照功能
- **相機整合**: 使用瀏覽器相機 API
- **濾鏡效果**: 貓咪主題疊加效果
- **照片處理**: 照片編輯和儲存功能

## 🗺️ 地圖功能
- **世界地圖**: D3.js 製作的互動地圖
- **旅行足跡**: 顯示去過的地點
- **地理服務**: 地理編碼和位置服務

## 注意事項
- 所有問題都先討論，不要馬上就執行
- 詢問問題時，若是我有錯誤要質疑我！
- sass 不使用 darken lighten，使用 rgba
- sass 不使用 !important
- 圖片盡量使用 background，視情況使用 <img>
- RWD 都以 mobile 延伸