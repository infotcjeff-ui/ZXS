# ServerAvatar Deployment Script 配置

## 📝 Deployment Script（部署腳本）

在 ServerAvatar 的 **Deployment Script** 欄位中，輸入以下內容：

### 完整版本（推薦，包含驗證）

```bash
# 安裝依賴
npm install

# 構建 ServerAvatar 版本
npm run build:serveravatar

# 驗證構建輸出
if [ ! -f "dist/index.html" ]; then
    echo "ERROR: dist/index.html not found!"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "ERROR: dist/assets directory not found!"
    exit 1
fi

# 確保 .htaccess 被複製
if [ -f ".htaccess" ] && [ ! -f "dist/.htaccess" ]; then
    cp .htaccess dist/.htaccess
    echo "Copied .htaccess to dist"
fi

echo "Build completed successfully!"
ls -la dist/
```

### 簡化版本（如果 ServerAvatar 自動安裝依賴）

如果 ServerAvatar 已經自動運行 `npm install`，可以使用：

```bash
# 構建 ServerAvatar 版本
npm run build:serveravatar

# 確保 .htaccess 被複製
if [ -f ".htaccess" ] && [ ! -f "dist/.htaccess" ]; then
    cp .htaccess dist/.htaccess
fi

echo "Build completed successfully!"
```

### 最簡版本（僅基本命令）

如果只需要基本構建：

```bash
npm install
npm run build:serveravatar
```

## ⚠️ 重要提示

### 必須使用 `build:serveravatar`

- ✅ **正確**：`npm run build:serveravatar`
  - 使用 `vite.config.serveravatar.js`
  - Base path: `/`（適合 ServerAvatar）
  
- ❌ **錯誤**：`npm run build`
  - 使用 `vite.config.js`
  - Base path: `/ZXS/`（適合 GitHub Pages）
  - 在 ServerAvatar 上會導致路徑錯誤

### 輸出目錄

- ✅ **必須是**：`dist`
- ❌ **不能是**：`.`、`src` 或其他目錄

## 📋 完整設置檢查清單

在 ServerAvatar 控制台中：

### Git 設置
- [ ] Provider: `Github`
- [ ] Repository: `infotcjeff-ui/ZXS`
- [ ] Branch: `main`

### 構建設置
- [ ] **Build Command**: `npm install && npm run build:serveravatar`
  - 或如果 ServerAvatar 自動安裝依賴：`npm run build:serveravatar`
- [ ] **Output Directory**: `dist`（必須是 `dist`！）
- [ ] **Node Version**: `20` 或 `20.x`

### Deployment Script（如果有的話）
- [ ] 輸入上面的完整版本或簡化版本

## 🔍 如何找到 Deployment Script 欄位

在 ServerAvatar 控制台中，Deployment Script 可能在：

1. **Git Deployment 頁面**：
   - 在 Git 設置下方
   - 標題可能是 "Deployment Script"、"Post-deploy Script" 或 "Build Script"

2. **Build Settings 頁面**：
   - 單獨的構建設置頁面
   - 可能包含 Deployment Script 選項

3. **應用設置主頁**：
   - 點擊應用名稱旁邊的 Expand 按鈕
   - 查看展開的設置選項

## ✅ 設置完成後

1. **保存設置**：點擊 Save 或 保存
2. **觸發部署**：點擊 Deploy 或 Redeploy
3. **等待構建**：通常需要 2-5 分鐘
4. **查看構建日誌**：確認看到 `✓ built` 和 `dist/` 文件列表

## 🔍 驗證部署

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

## 🆘 常見問題

### Q: ServerAvatar 沒有 Deployment Script 欄位？

**A:** 如果沒有 Deployment Script 欄位，只需要設置：
- **Build Command**: `npm install && npm run build:serveravatar`
- **Output Directory**: `dist`

ServerAvatar 會自動執行 Build Command。

### Q: 構建失敗怎麼辦？

**檢查：**
1. Node 版本是否設置為 `20`
2. Build Command 是否正確：`npm run build:serveravatar`
3. 查看構建日誌中的錯誤信息

### Q: 仍然顯示「載入中...」？

**檢查：**
1. Output Directory 是否設置為 `dist`（不是 `.` 或 `src`）
2. 構建日誌是否顯示成功
3. 瀏覽器 Network 標籤是否載入 `/assets/` 文件

