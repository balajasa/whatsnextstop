// types/ILayout.ts

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