# 修復 GitHub Pages 部署

## 🔍 問題診斷

GitHub Pages 顯示「載入中...」或「載入失敗」的原因可能是：
1. GitHub Pages 設置使用了 "Deploy from a branch" 而不是 "GitHub Actions"
2. GitHub Actions 工作流沒有正確執行
3. 構建輸出有問題

## ✅ 修復步驟

### 步驟 1: 檢查 GitHub Pages 設置

1. 訪問：`https://github.com/infotcjeff-ui/ZXS/settings/pages`
2. 在 **"Build and deployment"** 部分，查看 **"Source"** 設置

**必須設置為：**
- ✅ **Source: GitHub Actions**（不是 "Deploy from a branch"）

**如果顯示 "Deploy from a branch"：**
1. 點擊下拉選單
2. 選擇 **"GitHub Actions"**
3. 點擊 **"Save"** 保存

### 步驟 2: 觸發 GitHub Actions 部署

#### 方式 A: 手動觸發（推薦）

1. 訪問：`https://github.com/infotcjeff-ui/ZXS/actions`
2. 在左側找到 **"Deploy to GitHub Pages"** 工作流
3. 點擊 **"Run workflow"** 按鈕
4. 選擇 `main` 分支
5. 點擊 **"Run workflow"** 確認

#### 方式 B: 推送代碼觸發

推送任何更改到 `main` 分支，GitHub Actions 會自動觸發部署。

### 步驟 3: 檢查部署狀態

1. 訪問：`https://github.com/infotcjeff-ui/ZXS/actions`
2. 查看最新的 **"Deploy to GitHub Pages"** 工作流運行
3. 等待所有步驟完成（約 2-3 分鐘）
4. 確認所有步驟都顯示綠色的 ✓

**成功的構建應該包含：**
- ✅ Checkout
- ✅ Setup Node.js
- ✅ Install dependencies
- ✅ Build
- ✅ Copy 404.html to dist
- ✅ Add cache-busting meta tags
- ✅ Verify build output
- ✅ Setup Pages
- ✅ Upload artifact
- ✅ Deploy to GitHub Pages

### 步驟 4: 驗證部署

部署完成後：

1. **訪問網站**：`https://infotcjeff-ui.github.io/ZXS/`
2. **打開開發者工具**（F12）
3. **查看 Network 標籤**：
   - ✅ 應該看到：`/ZXS/assets/index-xxxxx.js`
   - ✅ 應該看到：`/ZXS/assets/index-xxxxx.css`
   - ❌ 不應該看到：`/src/main.jsx`
4. **查看 Console**：
   - 應該看到：`Detected base path: /ZXS`
   - 應該看到：`Hostname: infotcjeff-ui.github.io`

## 🔧 如果仍然無法載入

### 檢查 1: 確認 GitHub Pages 設置

在 `https://github.com/infotcjeff-ui/ZXS/settings/pages`：

- [ ] Source 顯示：**"GitHub Actions"**
- [ ] 不顯示 "Deploy from a branch" 選項
- [ ] 部署信息顯示："Last deployed by pages build and deployment workflow"

### 檢查 2: 查看構建日誌

在 GitHub Actions 中查看構建日誌：

1. 訪問：`https://github.com/infotcjeff-ui/ZXS/actions`
2. 點擊最新的工作流運行
3. 展開 **"Build"** 步驟
4. 查看是否有錯誤

**應該看到：**
```
✓ built in X.XXs
dist/index.html
dist/assets/index-xxxxx.js
dist/assets/index-xxxxx.css
```

### 檢查 3: 清除瀏覽器緩存

1. 按 `Ctrl + Shift + Delete`（Windows）或 `Cmd + Shift + Delete`（Mac）
2. 清除緩存和 Cookie
3. 重新載入頁面：`https://infotcjeff-ui.github.io/ZXS/`

### 檢查 4: 驗證 URL

**正確的 URL：**
- ✅ `https://infotcjeff-ui.github.io/ZXS/`（必須包含 `/ZXS/`）

**錯誤的 URL（會顯示 404）：**
- ❌ `https://infotcjeff-ui.github.io/`
- ❌ `https://infotcjeff-ui.github.io/ZXS`（缺少尾部斜線）

## 📋 快速檢查清單

- [ ] GitHub Pages Source 設置為 "GitHub Actions"
- [ ] GitHub Actions 工作流成功運行
- [ ] 構建日誌顯示 `✓ built` 和 `dist/` 文件
- [ ] 訪問 `https://infotcjeff-ui.github.io/ZXS/`（包含 `/ZXS/`）
- [ ] 瀏覽器 Network 標籤顯示 `/ZXS/assets/` 文件
- [ ] 清除瀏覽器緩存後重新載入

## 🆘 需要幫助？

如果問題仍然存在，請提供：
1. GitHub Pages 設置頁面截圖（`settings/pages`）
2. GitHub Actions 工作流運行截圖
3. 構建日誌截圖
4. 瀏覽器 Network 標籤截圖（F12）

