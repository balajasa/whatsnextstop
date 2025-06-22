// types/IMinigame.ts

export interface GameState {
  aExpanded: boolean
  bExpanded: boolean
  aDropping: boolean
  bDropping: boolean
  taskA: string
  taskB: string
  showResult: boolean
  resultShow: boolean
}