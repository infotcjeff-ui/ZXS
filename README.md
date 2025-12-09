# ZXSGit - 公司管理系統

一個現代化的公司管理系統，使用 React、Vite 和 Tailwind CSS 構建。

## 功能特色

- 🔐 用戶認證系統（登入/註冊）
- 📊 主控台（Dashboard）
- 🏢 公司管理（新增、編輯、刪除、查看詳情）
- ✅ 待辦清單管理
- 👤 用戶資料管理
- 🔧 管理員面板
- 📱 貼文產生器
- 🌐 繁體中文界面

## 技術棧

- **前端**: React 19, Vite, Tailwind CSS, React Router
- **後端**: Express.js, Node.js
- **數據存儲**: JSON 文件（users.json, data.json）

## 本地開發

### 安裝依賴

```bash
npm install
```

### 啟動開發服務器

```bash
# 啟動前端開發服務器（端口 5173）
npm run dev

# 啟動後端 API 服務器（端口 4000）
npm run server
```

### 構建生產版本

```bash
npm run build
```

## GitHub Pages 部署

### 自動部署

項目已配置 GitHub Actions 工作流，當推送到 `main` 分支時會自動構建和部署。

### 手動設置

1. 前往 GitHub 倉庫設置
2. 進入 **Pages** 設置
3. 選擇 **Source**: `GitHub Actions`
4. 保存設置

### 訪問部署的網站

部署完成後，網站將在以下 URL 可用：
```
https://infotcjeff-ui.github.io/ZXS/
```

## 重要說明

⚠️ **GitHub Pages 限制**：
- GitHub Pages 只提供靜態文件託管
- **後端 API 無法在 GitHub Pages 上運行**
- 前端應用可以正常顯示，但需要後端 API 的功能將無法使用

### 完整功能部署選項

如果需要完整功能（包括後端），建議使用以下服務：

- **Vercel** - 支持全棧應用
- **Netlify** - 支持函數和後端
- **Railway** - 支持 Node.js 後端
- **Render** - 免費 Node.js 託管

## 默認管理員帳號

- **Email**: `admin@zxsgit.local`
- **Password**: `admin321`

## 項目結構

```
├── src/
│   ├── auth/          # 認證相關
│   ├── components/    # 可重用組件
│   └── pages/         # 頁面組件
├── data/              # 數據文件
├── server.js          # 後端 API 服務器
└── public/            # 靜態資源
```

## 開發說明

- 前端運行在 `http://localhost:5173`
- 後端 API 運行在 `http://localhost:4000`
- 所有數據存儲在 `data/` 目錄的 JSON 文件中

## 許可證

MIT
