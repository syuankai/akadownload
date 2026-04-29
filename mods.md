# Minecraft 機器人所需模組

本專案使用 Mineflayer 作為機器人框架，以下是建議安裝的模組：

## 核心依賴（自動安裝）

這些會透過 npm 安裝：
- `mineflayer` - Minecraft 機器人框架
- `express` - Web 伺服器
- `socket.io` - 即時通訊
- `cors` - 跨域資源共享

## 建議的客戶端模組

在 Minecraft 伺服器端安裝以下模組可增強機器人功能：

### 1. 導航增強
- **Navicat** - 更好的路徑規劃
- **pathfinding** - 進階路徑搜尋演算法

### 2. 實用模組
- **Inventory Tweaks** - 更好的物品管理
- **VoxelMap** - 地圖顯示（可選）

### 3. 機器人專用
- **Mineflayer Plugins** - 各類型的機器人外掛
  - `mineflayer-pvp` - PVP 戰鬥
  - `mineflayer-pathfinder` - 進階路徑規劃
  - `mineflayer-navigate` - 導航系統

## 安裝方式

```bash
# 安裝 Node.js 依賴
npm install

# 啟動機器人
npm start

# 啟動控制面板伺服器
npm run server
```

## 連接說明

1. 啟動伺服器：`npm run server`
2. 在瀏覽器開啟 `http://localhost:3000`
3. 輸入伺服器位址並點擊連接
4. 機器人會以實體角色進入遊戲