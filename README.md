# MineAI Bot 專案說明

## 系統架構

```
┌─────────────────────────────────────────────────────────┐
│  Cloudflare Workers (免費托管)                           │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │   WebUI 控制面板 │    │  API 端點       │            │
│  │  (index.html)   │    │  /api/*         │            │
│  └────────┬────────┘    └────────┬────────┘            │
└───────────┼──────────────────────┼────────────────────┘
            │                       │
            │  瀏覽器存取           │ 儲存設定
            ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│  本地電腦 (需要保持開機)                                 │
│  ┌─────────────────┐                                     │
│  │  node bot.js   │ ← 連接到你的 MC 伺服器              │
│  │  (Mineflayer) │   以玩家身份進入遊戲                 │
│  └─────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 部署步驟

### 1. 部署 WebUI 到 Cloudflare Workers

```bash
# 安裝依賴
npm install

# 登入 Cloudflare
npx wrangler login

# 部署
npx wrangler deploy
```

### 2. 啟動本地 Bot

```bash
# 安裝 mineflayer
npm install

# 啟動 Bot
MC_HOST=mc.你的伺服器.com MC_PORT=25565 node bot.js
```

---

## 使用方式

1. 在瀏覽器開啟 Workers 網址
2. 在「🔌 伺服器連接」區塊輸入 MC 伺服器資訊
3. 點擊「連接伺服器」

---

## AI 模型設定

| 提供者 | API Key | 模型名稱範例 |
|--------|---------|--------------|
| Ollama | 無需 | `llama3`, `mistral` |
| OpenRouter | 需申請 | `openai/gpt-4o` |
| Google | 需申請 | `gemini-pro` |

---

## 環境變數

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `MC_HOST` | `localhost` | MC 伺服器 IP |
| `MC_PORT` | `25565` | MC 連接埠 |
| `MC_USERNAME` | `MineAI_Bot` | 機器人名稱 |

---

## 目錄結構

```
/webui         # 前端控制面板
bot.js         # 本地 Minecraft Bot
worker.js      # Workers 主程式
wrangler.toml  # 部署設定
package.json   # 專案設定
```
