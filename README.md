# Vercel Proxy Redirect to ngrok

## 📦 功能簡介 (Feature)
自動加上必要的 HTTP 標頭以繞過 ngrok 免費版的警告頁面，  
同時支援 **Message API** 與 **Webhook 回呼**。

所有路由（包含 `/callback`）都會改寫至 `/api/proxy`，  
再代理轉發至 `NGROK_TARGET`。

---

## ⚙️ 環境變數設定 (Environment Variables)

| 變數名稱 | 範例值 | 說明 |
|-----------|--------|------|
| `NGROK_TARGET` | `https://<你的-ngrok>.ngrok-free.dev` | 指向本機 ngrok 的公開網址 |

---

## 🚀 部署步驟 (Deployment)

1. 匯入此專案至你的 **Vercel** 帳號  
2. 設定環境變數 `NGROK_TARGET`  
3. 點擊 **Deploy**

---

## 🧪 測試方式 (Testing)

| 路由 | 轉發目標 |
|------|-----------|
| `/callback` | → `${NGROK_TARGET}/callback` |
| 其他路由 | → `${NGROK_TARGET}/<同路徑>` |

---

## 💡 提示
此專案可用於開發期間，方便將外部服務 (如 LINE Message API、Webhook 等)  
透過 Vercel 代理至本機 ngrok 通道，避免直接暴露本地端服務。
