# ServerAvatar 構建設置完整指南

## 📍 找到構建設置的位置

根據您的 ServerAvatar 控制台，構建設置可能在以下位置之一：

### 位置 1: Git Deployment 頁面下方
在您當前的 **Git** 頁面中，向下滾動，應該會看到：
- **Build Settings** 或 **Deployment Settings** 部分
- **Build Command** 輸入框
- **Output Directory** 輸入框
- **Node Version** 選擇器

### 位置 2: 單獨的設置頁面
在左側導航菜單中，可能會有：
- **Build Settings**
- **Deployment**
- **Settings** → **Build**

### 位置 3: 應用設置主頁
點擊應用名稱 `jeff-zxs-sss` 旁邊的 **Expand** 按鈕，可能會展開更多設置選項。

## ✅ 必須設置的值

### 1. Build Command（構建命令）

**輸入：**
```bash
npm install && npm run build:serveravatar
```

或者如果 ServerAvatar 自動運行 `npm install`，可以只輸入：
```bash
npm run build:serveravatar
```

⚠️ **重要：**
- ✅ 必須使用 `build:serveravatar`（不是 `build`）
- ✅ 這會使用 `vite.config.serveravatar.js`，設置 `base: '/'`
- ❌ 不要使用 `npm run build`（這會使用 `/ZXS/` base path）

### 2. Output Directory（輸出目錄）

**輸入：**
```
dist
```

⚠️ **這是最關鍵的設置！**
- ✅ **必須是：`dist`**
- ❌ **不能是：`.`**（當前目錄）
- ❌ **不能是：`src`**（源文件目錄）
- ❌ **不能是：空白**

### 3. Node Version（Node 版本）

**選擇或輸入：**
```
20
```

或者：
```
20.x
```

### 4. Deployment Script（部署腳本，如果有的話）

如果 ServerAvatar 有「Deployment Script」或「Post-deploy Script」選項，可以輸入：

```bash
# 驗證構建輸出
if [ ! -f "dist/index.html" ]; then
    echo "ERROR: dist/index.html not found!"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "ERROR: dist/assets directory not found!"
    exit 1
fi

echo "Build completed successfully!"
```

## 📋 完整設置檢查清單

在 ServerAvatar 控制台中，確認以下設置：

### Git 設置（您已經完成）
- [x] Provider: `Github`
- [x] Repository: `infotcjeff-ui/ZXS`
- [x] Branch: `main`

### 構建設置（需要確認）
- [ ] **Build Command**: `npm install && npm run build:serveravatar`
- [ ] **Output Directory**: `dist`（必須是 `dist`！）
- [ ] **Node Version**: `20` 或 `20.x`

## 🔍 如何找到構建設置

### 方法 1: 在 Git 頁面查找
1. 在您當前的 **Git** 頁面
2. 向下滾動，查找：
   - "Build Settings"
   - "Deployment Settings"
   - "Build Configuration"
   - 或類似的標題

### 方法 2: 查看左側導航
在左側導航菜單中查找：
- **Build Settings**
- **Deployment**
- **Settings** → 點擊展開查看子選項

### 方法 3: 查看應用設置
1. 點擊應用名稱 `jeff-zxs-sss` 旁邊的 **Expand** 按鈕
2. 查看展開的設置選項
3. 查找構建相關的設置

### 方法 4: 使用搜索功能
如果 ServerAvatar 有搜索功能，搜索：
- "build"
- "deploy"
- "output"

## 🎯 設置完成後的步驟

### 步驟 1: 保存設置
1. 確認所有設置都正確輸入
2. 點擊 **Save** 或 **保存** 按鈕

### 步驟 2: 觸發部署
1. 查找 **Deploy**、**Redeploy** 或 **Build** 按鈕
2. 點擊按鈕觸發部署
3. 等待構建完成（通常 2-5 分鐘）

### 步驟 3: 查看構建日誌
在構建過程中，查看構建日誌，應該看到：

```
> serveravatar-git@0.0.0 build:serveravatar
> vite build --config vite.config.serveravatar.js

vite v7.2.7 building client environment for production...
transforming...
✓ 58 modules transformed.
rendering chunks...
dist/index.html                   3.76 kB │ gzip:  1.76 kB
dist/assets/index-xxxxx.css      29.97 kB │ gzip:  5.95 kB
dist/assets/index-xxxxx.js       326.06 kB │ gzip: 96.48 kB
✓ built in 1.97s
✓ Copied .htaccess to dist
```

### 步驟 4: 驗證部署
部署完成後：

1. **訪問網站**：`https://jeff-zxs-sss.ooooo.one/`
2. **打開開發者工具**（F12）
3. **查看 Network 標籤**：
   - ✅ 應該看到：`/assets/index-xxxxx.js`
   - ✅ 應該看到：`/assets/index-xxxxx.css`
   - ❌ 不應該看到：`/src/main.jsx`
4. **查看 Console**：
   - 應該看到：`Detected base path: /`
   - 應該看到：`Hostname: jeff-zxs-sss.ooooo.one`

## ⚠️ 常見問題

### 問題 1: 找不到構建設置
**解決方案：**
- 嘗試點擊應用名稱旁邊的 **Expand** 按鈕
- 查看左側導航菜單的所有選項
- 聯繫 ServerAvatar 支持，詢問構建設置的位置

### 問題 2: 構建失敗
**檢查：**
- Node 版本是否設置為 `20`
- Build Command 是否正確：`npm run build:serveravatar`
- 查看構建日誌中的錯誤信息

### 問題 3: 仍然顯示「載入中...」
**檢查：**
- Output Directory 是否設置為 `dist`（不是 `.` 或 `src`）
- 構建日誌是否顯示成功
- 瀏覽器 Network 標籤是否載入 `/assets/` 文件

## 📸 需要幫助？

如果您找不到構建設置，請提供：
1. ServerAvatar Git 頁面的完整截圖
2. 左側導航菜單的截圖
3. 應用設置主頁的截圖

這樣我可以更準確地告訴您構建設置的具體位置。

## 🎉 設置完成後

一旦構建設置正確，ServerAvatar 會：
1. 從 GitHub 拉取代碼
2. 自動運行 `npm install`
3. 運行 `npm run build:serveravatar`
4. 部署 `dist` 目錄中的文件
5. 網站應該正常運行！

