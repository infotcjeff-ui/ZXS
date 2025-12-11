# ServerAvatar 故障排除指南

## 問題：頁面一直顯示「載入中...」，控制台顯示 MIME 類型錯誤

### 症狀
- 頁面顯示「載入中...」
- 控制台錯誤：`Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream"`
- 錯誤來源顯示 `main.jsx:1` 而不是 `index-xxxxx.js`

### 根本原因
這通常表示 ServerAvatar **沒有正確構建**或**部署了源文件而不是構建後的文件**。

### 解決步驟

#### 步驟 1: 檢查 ServerAvatar 構建設置

在 ServerAvatar 控制台確認：

1. **構建命令（Build Command）**：
   ```
   npm install && npm run build:serveravatar
   ```
   或
   ```bash
   npm install
   npm run build:serveravatar
   ```

2. **輸出目錄（Output Directory）**：
   ```
   dist
   ```
   ⚠️ **重要**：必須是 `dist`，不能是 `src`、`.` 或其他目錄

3. **Node 版本（Node Version）**：
   ```
   20
   ```
   或
   ```
   20.x
   ```

#### 步驟 2: 檢查構建日誌

在 ServerAvatar 控制台查看構建日誌，確認：

✅ **應該看到：**
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

❌ **如果看到錯誤：**
- 檢查 Node 版本是否正確
- 檢查 `package.json` 中是否有 `build:serveravatar` 腳本
- 檢查依賴是否正確安裝

#### 步驟 3: 驗證構建輸出

構建完成後，`dist` 目錄應該包含：

```
dist/
├── index.html          ← 必須存在
├── .htaccess          ← 應該存在（用於 MIME 類型）
├── vite.svg           ← 應該存在
└── assets/
    ├── index-xxxxx.js ← 必須存在（構建後的 JS）
    └── index-xxxxx.css ← 必須存在（構建後的 CSS）
```

**檢查 `dist/index.html` 的內容：**

✅ **正確的引用：**
```html
<script type="module" crossorigin src="/assets/index-xxxxx.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-xxxxx.css">
```

❌ **錯誤的引用（如果看到這個，說明沒有構建）：**
```html
<script type="module" src="/src/main.jsx"></script>
```

#### 步驟 4: 檢查部署的文件

在 ServerAvatar 控制台或通過 SSH 檢查部署的文件：

1. **確認部署的是 `dist` 目錄的內容**，不是整個項目
2. **確認 `index.html` 在根目錄**
3. **確認 `assets/` 目錄存在且包含 JS 和 CSS 文件**

#### 步驟 5: 配置 MIME 類型

即使構建正確，如果服務器沒有正確設置 MIME 類型，仍然會出現錯誤。

**如果使用 Apache：**
- `.htaccess` 文件應該在 `dist` 目錄中
- 確認 ServerAvatar 支持 `.htaccess` 文件

**如果使用 Nginx：**
- 需要在 ServerAvatar 控制台配置 Nginx 設置
- 參考 `nginx.conf` 文件中的配置

#### 步驟 6: 清除緩存並重新部署

1. **在 ServerAvatar 控制台：**
   - 找到「Redeploy」或「Deploy」按鈕
   - 點擊觸發重新部署
   - 等待構建完成

2. **在瀏覽器：**
   - 清除緩存（Ctrl+Shift+Delete）
   - 硬刷新（Ctrl+F5 或 Cmd+Shift+R）

### 常見錯誤配置

#### ❌ 錯誤 1: 輸出目錄設置為 `src`
```
Output Directory: src
```
這會部署源文件而不是構建後的文件。

#### ❌ 錯誤 2: 輸出目錄設置為 `.` 或根目錄
```
Output Directory: .
```
這會部署整個項目，包括源文件。

#### ❌ 錯誤 3: 使用錯誤的構建命令
```
Build Command: npm run build
```
這會使用 GitHub Pages 配置（base: `/ZXS/`），導致路徑錯誤。

#### ✅ 正確配置
```
Build Command: npm install && npm run build:serveravatar
Output Directory: dist
Node Version: 20
```

### 驗證清單

部署前檢查：

- [ ] 構建命令是 `npm run build:serveravatar`
- [ ] 輸出目錄是 `dist`
- [ ] Node 版本是 20 或 20.x
- [ ] 構建日誌顯示成功
- [ ] `dist/index.html` 存在
- [ ] `dist/assets/` 目錄存在
- [ ] `dist/index.html` 引用 `/assets/index-xxxxx.js`（不是 `/src/main.jsx`）
- [ ] `.htaccess` 文件在 `dist` 目錄中（如果使用 Apache）

### 如果問題仍然存在

1. **檢查 ServerAvatar 構建日誌**：
   - 複製完整的構建日誌
   - 檢查是否有錯誤或警告

2. **檢查瀏覽器 Network 標籤**：
   - 打開開發者工具（F12）
   - 切換到 Network 標籤
   - 刷新頁面
   - 檢查哪些文件無法載入
   - 檢查響應頭的 `Content-Type`

3. **聯繫 ServerAvatar 支持**：
   - 提供構建日誌
   - 提供錯誤截圖
   - 說明您已經嘗試的步驟
   - 要求他們檢查：
     - 構建是否正確執行
     - 輸出目錄是否正確
     - MIME 類型是否正確設置

### 測試構建本地

在本地測試構建：

```bash
# 清理舊的構建
rm -rf dist

# 構建
npm run build:serveravatar

# 檢查輸出
ls -la dist/
cat dist/index.html | grep "script"
```

應該看到：
- `dist/index.html` 引用 `/assets/index-xxxxx.js`
- 不是 `/src/main.jsx`

