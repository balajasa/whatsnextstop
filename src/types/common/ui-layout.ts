// types/ILayout.ts

// home
export interface SidebarRef {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  resetSidebarState: () => void
}

// sidebar
export interface SidebarProps {
  isMobile?: boolean
  headerHeight?: number
}

export interface SidebarItem {
  name: string
  icon: string
  path: string
  category?: string
}

// Breadcrumb
export interface BreadcrumbItem {
  text: string
  icon?: string
  path?: string
}

export interface BreadcrumbProps {
  homeText?: string
  separator?: string
  manualItems?: BreadcrumbItem[] | null
  manualShow?: boolean | null
}