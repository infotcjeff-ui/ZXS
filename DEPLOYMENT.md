# GitHub Pages 部署指南

## 步驟 1: 啟用 GitHub Pages

1. 前往您的 GitHub 倉庫：`https://github.com/infotcjeff-ui/ZXS`
2. 點擊 **Settings**（設置）標籤
3. 在左側菜單中找到 **Pages**
4. 在 **Source** 部分，選擇 **GitHub Actions**
5. 點擊 **Save**（保存）

## 步驟 2: 觸發部署

有兩種方式觸發部署：

### 方式 A: 自動部署（推薦）
- 當您推送代碼到 `main` 分支時，GitHub Actions 會自動構建和部署
- 前往 **Actions** 標籤查看部署進度

### 方式 B: 手動觸發
1. 前往 **Actions** 標籤
2. 選擇 **Deploy to GitHub Pages** 工作流
3. 點擊 **Run workflow** 按鈕
4. 選擇 `main` 分支
5. 點擊 **Run workflow**

## 步驟 3: 等待部署完成

1. 在 **Actions** 標籤中查看工作流狀態
2. 等待所有步驟完成（通常需要 2-3 分鐘）
3. 看到綠色的 ✓ 標記表示部署成功

## 步驟 4: 訪問您的網站

部署完成後，您的網站將在以下 URL 可用：

**正確的 URL：**
```
https://infotcjeff-ui.github.io/ZXS/
```

**重要：** 必須包含 `/ZXS/` 路徑！

### 常見錯誤 URL（會顯示 404）：
- ❌ `https://infotcjeff-ui.github.io/` 
- ❌ `https://infotcjeff-ui.github.io/login`
- ❌ `https://infotcjeff-ui.github.io/ZXS` (缺少尾部斜線)

### 正確的訪問方式：
- ✅ `https://infotcjeff-ui.github.io/ZXS/`
- ✅ `https://infotcjeff-ui.github.io/ZXS/login`
- ✅ `https://infotcjeff-ui.github.io/ZXS/dashboard`

## 步驟 5: 分享給其他人

將以下 URL 分享給其他人：
```
https://infotcjeff-ui.github.io/ZXS/
```

## 故障排除

### 問題 1: 仍然顯示 404
- 確認您訪問的 URL 包含 `/ZXS/`
- 檢查 GitHub Actions 是否成功完成
- 等待 5-10 分鐘讓 DNS 傳播

### 問題 2: 頁面空白
- 檢查瀏覽器控制台是否有錯誤
- 確認所有資源路徑正確（應該以 `/ZXS/` 開頭）

### 問題 3: GitHub Actions 失敗
- 檢查 **Actions** 標籤中的錯誤訊息
- 確認 `package.json` 和依賴項正確
- 確認 `vite.config.js` 中的 base path 設置為 `/ZXS/`

## 重要提示

⚠️ **GitHub Pages 限制：**
- GitHub Pages 只提供靜態文件託管
- **後端 API 無法在 GitHub Pages 上運行**
- 需要後端的功能（登入、註冊、數據保存）將無法使用
- 前端界面可以正常顯示，但功能受限

### 如需完整功能，建議使用：
- **Vercel** - 支持全棧應用和 API
- **Netlify** - 支持函數和後端
- **Railway** - 支持 Node.js 後端
- **Render** - 免費 Node.js 託管

## 更新網站

每次您推送代碼到 `main` 分支時，網站會自動更新。只需：
1. 提交更改：`git commit -m "Your message"`
2. 推送到 GitHub：`git push origin main`
3. 等待 GitHub Actions 自動部署（2-3 分鐘）

