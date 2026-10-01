// ===================================
// 全站導覽設定（頂部 nav / 手機底部 tab 共用）
// ===================================

export interface NavItem {
  name: string
  path: string
}

export interface NavCategory {
  key: 'home' | 'go' | 'footprint' | 'fun'
  name: string
  icon: string
  path?: string
  items?: NavItem[]
  matches: string[]
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    key: 'home',
    name: '首頁',
    icon: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    path: '/home',
    matches: ['/home'],
  },
  {
    key: 'go',
    name: '要去哪裡',
    icon: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    items: [
      { name: '行程表', path: '/itinerary' },
      { name: '旅程列表', path: '/trips' },
    ],
    matches: ['/itinerary', '/trips'],
  },
  {
    key: 'footprint',
    name: '踏踏腳印',
    icon:
      '<path d="M7 4c1.7 0 2.5 1.8 2.5 4S8.7 12 7 12 4.5 10.2 4.5 8 5.3 4 7 4z"/><path d="M5 14.5h4v1.8a2 2 0 0 1-4 0z"/><path d="M17 8c1.7 0 2.5 1.8 2.5 4s-.8 4-2.5 4-2.5-1.8-2.5-4 .8-4 2.5-4z"/><path d="M15 18.5h4v1.3a2 2 0 0 1-4 0z"/>',
    items: [
      { name: '旅行地圖', path: '/travelmap' },
      { name: '我的足跡', path: '/travel-gallery' },
    ],
    matches: ['/travelmap', '/travel-gallery'],
  },
  {
    key: 'fun',
    name: '小小樂趣',
    icon:
      '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>',
    items: [
      { name: '從天而降', path: '/dropblock' },
      { name: '命運輪盤', path: '/foodwheel' },
    ],
    matches: ['/dropblock', '/foodwheel'],
  },
]

/** 依目前路徑找出所屬分類 */
export const findActiveCategory = (path: string): NavCategory['key'] | null => {
  const hit = NAV_CATEGORIES.find((c) => c.matches.some((m) => path === m || path.startsWith(`${m}/`) || path.startsWith(`${m}-`)))
  return hit ? hit.key : null
}
