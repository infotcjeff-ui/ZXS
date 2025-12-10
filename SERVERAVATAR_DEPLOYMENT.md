# ServerAvatar 部署指南

## 問題說明

由於項目配置為 GitHub Pages 部署（base path: `/ZXS/`），在 ServerAvatar 上部署時會出現路徑問題。

## 解決方案

### 方案 1: 使用專用構建命令（推薦）

1. **構建 ServerAvatar 版本：**
   ```bash
   npm run build:serveravatar
   ```

2. **上傳構建文件：**
   - 將 `dist` 文件夾中的所有內容上傳到 ServerAvatar
   - 確保 `index.html` 在根目錄

3. **設置 ServerAvatar：**
   - 在 ServerAvatar 的 Git 部署設置中，選擇 `main` 分支
   - 構建命令：`npm run build:serveravatar`
   - 構建輸出目錄：`dist`

### 方案 2: 使用環境變量

1. **在 ServerAvatar 設置環境變量：**
   - 變量名：`VITE_BASE_PATH`
   - 變量值：`/`

2. **使用標準構建命令：**
   ```bash
   npm run build
   ```

### 方案 3: 自動檢測（已實現）

項目已包含自動環境檢測功能：
- 如果 hostname 包含 `tempavatar.xyz` 或 `serveravatar`，自動使用根路徑 `/`
- 如果是 `infotcjeff-ui.github.io`，使用 `/ZXS/`

**注意：** 此方案需要確保 `vite.config.js` 中的 base 設置正確。

## 部署步驟

### 使用 Git 部署

1. 在 ServerAvatar 控制台：
   - 進入應用設置
   - 選擇 "Git Deployment"
   - 連接 GitHub 倉庫：`infotcjeff-ui/ZXS`
   - 選擇分支：`main`

2. **構建配置：**
   - 構建命令：`npm run build:serveravatar`
   - 輸出目錄：`dist`
   - Node 版本：20

3. **部署後：**
   - 訪問您的 ServerAvatar URL（例如：`jeff-zxs-sss.tempavatar.xyz`）
   - 應用應該自動檢測環境並使用正確的 base path

## 故障排除

### 問題：仍然顯示載入中

1. **檢查構建命令：**
   - 確認使用 `npm run build:serveravatar` 而不是 `npm run build`

2. **檢查文件路徑：**
   - 確認 `dist/index.html` 中的資源路徑是相對路徑（以 `/` 開頭，不是 `/ZXS/`）

3. **檢查控制台：**
   - 打開瀏覽器開發者工具
   - 查看 Console 和 Network 標籤
   - 確認 base path 檢測是否正確

### 問題：資源 404 錯誤

- 確認構建輸出目錄設置為 `dist`
- 確認所有資源文件都在 `dist/assets/` 目錄中
- 檢查 `dist/index.html` 中的資源路徑

## 同時支持兩個部署環境

項目現在可以同時支持：
- ✅ GitHub Pages: `https://infotcjeff-ui.github.io/ZXS/`
- ✅ ServerAvatar: `https://jeff-zxs-sss.tempavatar.xyz/`

兩個環境會自動檢測並使用正確的 base path。

