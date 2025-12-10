# ServerAvatar 完整設置指南

## 設置步驟

### 1. Repository Type（倉庫類型）
- **選擇：** `Public`（公開）
- 如果您的倉庫是私有的，選擇 `Private` 並配置 Deployment Key

### 2. Deployment Key（部署密鑰）
- **如果選擇 Public：** 不需要配置 Deployment Key
- **如果選擇 Private：** 
  - 點擊 "Regenerate" 生成新的 SSH 密鑰
  - 點擊 "Copy" 複製公鑰
  - 將此公鑰添加到您的 GitHub 倉庫設置中：
    1. 進入 GitHub 倉庫：`https://github.com/infotcjeff-ui/ZXS`
    2. 點擊 `Settings` → `Deploy keys`
    3. 點擊 `Add deploy key`
    4. 貼上複製的公鑰
    5. 勾選 `Allow write access`（如果需要）
    6. 點擊 `Add key`

### 3. Select an Account（選擇帳號）
- **選擇：** `infotcjeff@gmail.com`
- 確保此帳號有權限訪問倉庫

### 4. Select a Repository（選擇倉庫）
- **輸入或選擇：** `infotcjeff-ui/ZXS`
- 格式：`用戶名/倉庫名`

### 5. Select a Branch（選擇分支）
- **選擇：** `main`
- 如果您的默認分支是 `master`，則選擇 `master`

### 6. Deployment Script（部署腳本）
在代碼編輯器中輸入以下腳本：

```bash
# 安裝依賴
npm install

# 構建 ServerAvatar 版本
npm run build:serveravatar

# 如果需要，可以添加其他命令
# 例如：npm run test（如果有測試）
```

**重要：** 必須使用 `npm run build:serveravatar` 而不是 `npm run build`，因為這會使用正確的 base path (`/`) 而不是 GitHub Pages 的 base path (`/ZXS/`)

## 完整設置示例

### 設置摘要
```
Repository Type: Public
Deployment Key: (不需要，因為是 Public)
Account: infotcjeff@gmail.com
Repository: infotcjeff-ui/ZXS
Branch: main
Deployment Script:
  npm install
  npm run build:serveravatar
```

### 輸出目錄設置
在 ServerAvatar 的構建設置中：
- **Output Directory（輸出目錄）：** `dist`
- **Node Version（Node 版本）：** `20` 或 `20.x`

## 驗證部署

部署完成後：

1. **檢查構建日誌**
   - 確認 `npm install` 成功
   - 確認 `npm run build:serveravatar` 成功
   - 確認 `dist` 目錄已生成

2. **訪問應用**
   - 訪問您的 ServerAvatar URL（例如：`jeff-zxs-sss.tempavatar.xyz`）
   - 打開瀏覽器開發者工具（F12）
   - 查看 Console，應該看到：
     ```
     Detected base path: /
     Hostname: jeff-zxs-sss.tempavatar.xyz
     ```

3. **檢查 Network 標籤**
   - 確認所有資源（JS、CSS）都正確載入
   - 確認沒有 404 錯誤

## 常見問題

### 問題 1: 構建失敗
**解決方案：**
- 確認 Node 版本是 20 或更高
- 確認 `package.json` 中有 `build:serveravatar` 腳本
- 檢查構建日誌中的錯誤信息

### 問題 2: 頁面顯示空白
**解決方案：**
- 確認使用了 `npm run build:serveravatar` 而不是 `npm run build`
- 確認 Output Directory 設置為 `dist`
- 檢查瀏覽器控制台的錯誤信息

### 問題 3: 資源 404 錯誤
**解決方案：**
- 確認 base path 是 `/` 而不是 `/ZXS/`
- 檢查 `dist/index.html` 中的資源路徑
- 確認所有文件都在 `dist` 目錄中

### 問題 4: 部署後沒有更新
**解決方案：**
- 確認代碼已推送到 `main` 分支
- 觸發手動部署或等待自動部署
- 清除瀏覽器緩存（Ctrl+Shift+R 或 Cmd+Shift+R）

## 自動部署

ServerAvatar 會在以下情況自動部署：
- 推送到 `main` 分支時（如果啟用了自動部署）
- 手動觸發部署時

## 手動觸發部署

如果需要手動觸發部署：
1. 在 ServerAvatar 控制台找到 "Deploy" 或 "Redeploy" 按鈕
2. 點擊按鈕觸發部署
3. 等待構建完成

## 環境變量（可選）

如果需要設置環境變量：
- 在 ServerAvatar 設置中找到 "Environment Variables"
- 添加變量（如果需要）：
  - `NODE_ENV=production`
  - 其他自定義變量

## 注意事項

1. **必須使用 `build:serveravatar` 命令**
   - 這個命令會使用 `vite.config.serveravatar.js`
   - 設置 `base: '/'` 用於 ServerAvatar 部署

2. **不要使用 `build` 命令**
   - `build` 命令使用 `vite.config.js`
   - 設置 `base: '/ZXS/'` 用於 GitHub Pages
   - 在 ServerAvatar 上會導致路徑錯誤

3. **確保依賴已安裝**
   - `package.json` 中必須包含所有必要的依賴
   - 構建前會自動運行 `npm install`

4. **檢查構建輸出**
   - 確認 `dist` 目錄包含：
     - `index.html`
     - `assets/` 目錄（包含 JS 和 CSS 文件）

## 技術細節

### Base Path 自動檢測
應用會自動檢測部署環境：
- 如果 hostname 包含 `tempavatar.xyz` 或 `serveravatar`，使用 `/`
- 如果是 `infotcjeff-ui.github.io`，使用 `/ZXS/`

### 構建配置
- `vite.config.serveravatar.js` 用於 ServerAvatar
- `vite.config.js` 用於 GitHub Pages
- 兩個配置都包含 hash 文件名以實現緩存清除

## 支持

如果遇到問題：
1. 檢查 ServerAvatar 構建日誌
2. 檢查瀏覽器控制台錯誤
3. 確認所有設置都正確
4. 查看 `SERVERAVATAR_DEPLOYMENT.md` 獲取更多詳細信息

