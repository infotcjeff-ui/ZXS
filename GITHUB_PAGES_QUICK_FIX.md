# GitHub Pages 快速修復指南

## 🔴 當前問題

`https://infotcjeff-ui.github.io/ZXS/` 顯示「載入失敗」

## ✅ 立即修復步驟（3 步）

### 步驟 1: 檢查 GitHub Pages 設置

1. **訪問**：`https://github.com/infotcjeff-ui/ZXS/settings/pages`
2. **找到 "Build and deployment" 部分**
3. **檢查 "Source" 設置**

**必須設置為：**
- ✅ **Source: GitHub Actions**

**如果顯示 "Deploy from a branch"：**
1. 點擊下拉選單
2. 選擇 **"GitHub Actions"**
3. 點擊 **"Save"** 保存

### 步驟 2: 手動觸發部署

1. **訪問**：`https://github.com/infotcjeff-ui/ZXS/actions`
2. **在左側找到 "Deploy to GitHub Pages" 工作流**
3. **點擊 "Run workflow" 按鈕**（右上角）
4. **選擇 `main` 分支**
5. **點擊 "Run workflow" 確認**

### 步驟 3: 等待並驗證

1. **等待部署完成**（約 2-3 分鐘）
2. **訪問**：`https://infotcjeff-ui.github.io/ZXS/`
3. **清除瀏覽器緩存**（Ctrl+Shift+Delete）後重新載入

## 🔍 如何確認部署成功

### 在 GitHub Actions 中：

1. 訪問：`https://github.com/infotcjeff-ui/ZXS/actions`
2. 查看最新的 "Deploy to GitHub Pages" 工作流
3. 確認所有步驟都顯示綠色的 ✓

**成功的構建應該包含：**
- ✅ Checkout
- ✅ Setup Node.js
- ✅ Install dependencies
- ✅ Build
- ✅ Copy 404.html to dist
- ✅ Verify build output
- ✅ Setup Pages
- ✅ Upload artifact
- ✅ Deploy to GitHub Pages

### 在瀏覽器中：

1. **打開開發者工具**（F12）
2. **查看 Network 標籤**：
   - ✅ 應該看到：`/ZXS/assets/index-xxxxx.js`（200 狀態）
   - ✅ 應該看到：`/ZXS/assets/index-xxxxx.css`（200 狀態）
   - ❌ 不應該看到：`/src/main.jsx`
3. **查看 Console**：
   - ✅ 應該看到：`Detected base path: /ZXS`
   - ✅ 應該看到：`Hostname: infotcjeff-ui.github.io`
   - ✅ 應該看到：`React rendered successfully`

## ⚠️ 常見問題

### Q: 仍然顯示「載入失敗」？

**檢查：**
1. GitHub Pages Source 是否設置為 "GitHub Actions"？
2. GitHub Actions 工作流是否成功完成？
3. 是否清除了瀏覽器緩存？
4. URL 是否包含 `/ZXS/`（不是 `/ZXS`）？

### Q: GitHub Actions 工作流失敗？

**檢查構建日誌：**
1. 訪問：`https://github.com/infotcjeff-ui/ZXS/actions`
2. 點擊失敗的工作流
3. 查看錯誤信息
4. 確認 Node.js 版本和構建命令正確

### Q: 找不到 "Run workflow" 按鈕？

**可能原因：**
- 工作流正在運行中
- 需要等待當前運行完成
- 或者直接推送代碼到 `main` 分支觸發自動部署

## 📋 快速檢查清單

- [ ] GitHub Pages Source 設置為 "GitHub Actions"
- [ ] 手動觸發了 GitHub Actions 部署
- [ ] 等待部署完成（2-3 分鐘）
- [ ] 訪問 `https://infotcjeff-ui.github.io/ZXS/`（包含 `/ZXS/`）
- [ ] 清除瀏覽器緩存
- [ ] 瀏覽器 Network 標籤顯示 `/ZXS/assets/` 文件

## 🎯 關鍵要點

1. **GitHub Pages Source 必須是 "GitHub Actions"**
   - 不是 "Deploy from a branch"
   - 這會使用構建後的 `dist` 文件夾

2. **URL 必須包含 `/ZXS/`**
   - ✅ `https://infotcjeff-ui.github.io/ZXS/`
   - ❌ `https://infotcjeff-ui.github.io/ZXS`（缺少尾部斜線）

3. **清除瀏覽器緩存**
   - 舊的緩存可能導致載入失敗
   - 使用 Ctrl+Shift+Delete 清除

