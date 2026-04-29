# MineAI Bot 專案說明

## 部署方式（Cloudflare Workers）

### 快速部署
1. 安裝 Wrangler CLI：
   ```bash
   npm install -g wrangler
   ```
2. 登入 Cloudflare：
   ```bash
   wrangler login
   ```
3. 部署至 Workers：
   ```bash
   wrangler deploy
   ```
4. 在瀏覽器開啟 Workers 網址

### 本地開發
```bash
wrangler dev
```

---

## 功能
- 以 Mineflayer 實作角色進入 Minecraft 伺服器
- 支援 WASD/跳躍/蹲下/攻擊/聊天/重生/即時狀態顯示
- 控制面板可自訂伺服器位址、名稱
- **AI 模型整合**：可連接 Ollama/OpenRouter/Google Gemini

---

## 2. AI 模型設定

在控制面板的「🤖 AI 模型設定」區塊可配置：

| 提供者 | API Key | 模型名稱範例 | 預設端點 |
|--------|---------|--------------|----------|
| Ollama | 無需 | `llama3`, `mistral`, `codellama` | `http://localhost:11434` |
| OpenRouter | 需申請 | `openai/gpt-4o`, `anthropic/claude-3-opus` | `https://openrouter.ai/api/v1` |
| Google | 需申請 | `gemini-pro`, `gemini-1.5-pro` | `https://generativelanguage.googleapis.com/v1` |

### 設定步驟
1. 選擇模型提供者（Ollama/OpenRouter/Google）
2. 輸入 API Key（Ollama 無需）
3. 輸入模型名稱
4. 可自訂 API 端點（選填）
5. 點擊「儲存設定」保存
6. 可點擊「測試連線」驗證設定

### 取得 API Key
- **Ollama**：本地安裝，免費 https://ollama.ai
- **OpenRouter**：https://openrouter.ai/settings/keys
- **Google**：https://aistudio.google.com/app/apikey

---

## 2. Cloudflare Workers 靜態掛載 WebUI

### 步驟
1. 進入 `webui` 目錄，將所有檔案（如 index.html、靜態資源）上傳至 Cloudflare Workers Sites 或 Pages
2. 若要用 Workers 直接部署，請參考下方 `webui/worker.js` 範例：

```js
// webui/worker.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(await env.ASSETS.get("index.html", "stream"), {
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }
    // 其他靜態資源
    const asset = await env.ASSETS.get(url.pathname.slice(1), "stream");
    if (asset) {
      // 自動判斷 mime type
      const ext = url.pathname.split('.').pop();
      const mime = {
        js: "application/javascript",
        css: "text/css",
        png: "image/png",
        jpg: "image/jpeg",
        svg: "image/svg+xml"
      }[ext] || "application/octet-stream";
      return new Response(asset, { headers: { "content-type": mime } });
    }
    return new Response("Not found", { status: 404 });
  }
};
```

3. 使用 wrangler 部署：
   ```bash
   wrangler publish
   ```

### 注意
- Cloudflare Workers 只負責靜態前端（webui），Minecraft 機器人伺服器（Node.js）仍需自架並公開 API 給前端連線
- 請於 `webui/index.html` 內將 `socket.io` 連線目標改為你的伺服器公開網址

---

## 3. 進階
- 可搭配 Cloudflare Tunnel 讓本地 bot 伺服器公開給 webui 使用
- 支援自訂 Mineflayer 插件與伺服器模組，詳見 [mods.md](mods.md)

---

## 目錄結構
```
/webui         # 前端控制面板，可部署至 Cloudflare Workers
/src           # Node.js 機器人與伺服器
/mods.md       # 建議安裝的 Minecraft 伺服器模組
```

---

如需協助，請參考原始碼註解或 issues。