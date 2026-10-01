// ===================================
// 旅行地圖的主題配色
// ===================================

// 地圖底色：海、陸地、國界、去過的國家
export const MAP_COLORS = {
  sea: '#DCEAF1',
  land: '#FFFDF8',
  border: '#C9B89F',
  visited: '#F6E7B0',  // 紙膠帶黃
}

// 圖釘四級：初訪 1 / 回訪 2～4 / 熟客 5～9 / 常去 10+
export const MAP_PIN_COLORS = {
  first: { fill: '#4F8DBF', text: '#FFFFFF' },     // 藍
  repeat: { fill: '#E8B931', text: '#3A332C' },    // 黃，深色字
  regular: { fill: '#7A9A4E', text: '#FFFFFF' },   // 抹茶綠
  frequent: { fill: '#BC002D', text: '#FFFFFF' },  // 日之丸紅
}
