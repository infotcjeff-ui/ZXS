# GitHub Pages 設置指南 - 重要！

## ⚠️ 當前問題

您的 GitHub Pages 設置可能不正確，導致網站無法載入。

## 🔧 解決步驟

### 步驟 1: 更改 GitHub Pages 設置

1. 前往：`https://github.com/infotcjeff-ui/ZXS/settings/pages`

2. 在 **"Build and deployment"** 部分，找到 **"Source"** 下拉選單

3. **重要：** 將設置從 **"Deploy from a branch"** 改為 **"GitHub Actions"**

4. 點擊 **"Save"** 保存設置

### 步驟 2: 驗證設置

設置完成後，您應該看到：
- ✅ Source: **GitHub Actions**
- ✅ 不再顯示 "Deploy from a branch" 選項
- ✅ 部署信息顯示 "Last deployed by pages build and deployment workflow"

### 步驟 3: 觸發部署

如果設置正確，您可以：

**方式 A: 自動部署（推薦）**
- 推送任何更改到 `main` 分支
- GitHub Actions 會自動構建和部署

**方式 B: 手動觸發**
1. 前往 **Actions** 標籤
2. 選擇 **"Deploy to GitHub Pages"** 工作流
3. 點擊 **"Run workflow"**
4. 選擇 `main` 分支
5. 點擊 **"Run workflow"**

### 步驟 4: 檢查部署狀態

1. 前往 **Actions** 標籤
2. 查看最新的工作流運行
3. 等待所有步驟完成（約 2-3 分鐘）
4. 看到綠色的 ✓ 表示成功

## 📋 設置對比

### ❌ 錯誤設置（當前）
```
Source: Deploy from a branch
Branch: main
Folder: / (root)
```
這會嘗試提供源代碼，導致 404 錯誤。

### ✅ 正確設置
```
Source: GitHub Actions
```
這會使用構建後的 `dist` 文件夾內容。

## 🔍 如何確認設置正確

1. 前往 Settings → Pages
2. 確認 Source 顯示 **"GitHub Actions"**
3. 確認部署信息顯示 "Last deployed by pages build and deployment workflow"
4. 如果看到 "Deploy from a branch"，說明設置不正確

## 🚨 常見問題

### Q: 為什麼會出現 404 錯誤？
A: 因為 GitHub Pages 正在嘗試提供源代碼文件（如 `src/main.jsx`），而不是構建後的 JavaScript 文件。

### Q: 更改設置後需要做什麼？
A: 更改設置後，需要觸發一次部署。可以推送任何更改，或手動運行 GitHub Actions 工作流。

### Q: 設置更改後多久生效？
A: 通常立即生效，但需要等待 GitHub Actions 完成部署（2-3 分鐘）。

## 📞 需要幫助？

如果設置後仍有問題，請檢查：
1. GitHub Actions 是否成功運行
2. 控制台是否有錯誤訊息
3. Network 標籤中哪些資源無法載入

