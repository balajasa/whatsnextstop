// types/IMinigame.ts

export interface GameState {
  aExpanded: boolean
  bExpanded: boolean
  aDropping: boolean
  bDropping: boolean
  aShowMap: boolean
  bShowMap: boolean
  taskA: string
  taskB: string
  merging: boolean
  showFinalMap: boolean
  finalMapShow: boolean
}