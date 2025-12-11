# ServerAvatar MIME 類型修復指南

## 問題描述

如果您的 ServerAvatar 部署出現以下錯誤：
- `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream"`
- 頁面一直顯示「載入中...」

這通常是因為服務器沒有正確設置 JavaScript 文件的 MIME 類型。

## 解決方案

### 方案 1: 使用 .htaccess（Apache 服務器）

如果 ServerAvatar 使用 Apache 服務器，`.htaccess` 文件已經包含在項目中，會自動複製到 `dist` 目錄。

### 方案 2: 配置 Nginx（Nginx 服務器）

如果 ServerAvatar 使用 Nginx，您需要在 ServerAvatar 控制台中配置 Nginx 設置：

1. **登入 ServerAvatar 控制台**
2. **找到您的應用設置**
3. **查找 "Nginx Configuration" 或 "Web Server Settings"**
4. **添加以下配置：**

```nginx
# Set correct MIME types for JavaScript modules
location ~* \.(js|mjs)$ {
    add_header Content-Type "application/javascript; charset=utf-8";
    add_header Access-Control-Allow-Origin "*";
}

# Set correct MIME types for CSS
location ~* \.css$ {
    add_header Content-Type "text/css; charset=utf-8";
}

# Set correct MIME types for SVG
location ~* \.svg$ {
    add_header Content-Type "image/svg+xml";
}

# Cache control for assets
location ~* \.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Fallback to index.html for client-side routing
location / {
    try_files $uri $uri/ /index.html;
}
```

### 方案 3: 聯繫 ServerAvatar 支持

如果以上方案都不起作用，請聯繫 ServerAvatar 支持團隊，要求他們：
1. 確保 JavaScript 文件（.js, .mjs）的 MIME 類型設置為 `application/javascript`
2. 確保 CSS 文件的 MIME 類型設置為 `text/css`
3. 確保 SVG 文件的 MIME 類型設置為 `image/svg+xml`

## 驗證修復

修復後，請執行以下步驟驗證：

1. **清除瀏覽器緩存**（Ctrl+Shift+Delete 或 Cmd+Shift+Delete）
2. **硬刷新頁面**（Ctrl+F5 或 Cmd+Shift+R）
3. **打開瀏覽器開發者工具**（F12）
4. **檢查 Network 標籤**：
   - 找到 JavaScript 文件（例如 `index-xxxxx.js`）
   - 檢查 Response Headers 中的 `Content-Type`
   - 應該顯示 `application/javascript` 或 `application/javascript; charset=utf-8`
5. **檢查 Console 標籤**：
   - 應該不再有 MIME 類型錯誤
   - 應用應該正常載入

## 常見問題

### Q: 為什麼會出現這個問題？
A: 某些服務器配置默認將 `.js` 文件識別為 `application/octet-stream`（二進制文件），而不是 `application/javascript`。瀏覽器的嚴格 MIME 類型檢查會阻止載入這些文件。

### Q: .htaccess 文件是否會被自動部署？
A: 是的，`vite.config.serveravatar.js` 已經配置為在構建時自動將 `.htaccess` 文件複製到 `dist` 目錄。

### Q: 如何確認 ServerAvatar 使用 Apache 還是 Nginx？
A: 您可以：
1. 檢查 ServerAvatar 文檔
2. 聯繫 ServerAvatar 支持
3. 查看 HTTP 響應頭中的 `Server` 字段（在瀏覽器開發者工具的 Network 標籤中）

### Q: 如果問題仍然存在怎麼辦？
A: 
1. 確認構建命令是 `npm run build:serveravatar`
2. 確認輸出目錄是 `dist`
3. 檢查 ServerAvatar 構建日誌，確認構建成功
4. 確認 `.htaccess` 文件在 `dist` 目錄中
5. 聯繫 ServerAvatar 支持團隊

## 技術細節

### MIME 類型要求

根據 HTML 規範，ES 模塊（`<script type="module">`）需要：
- JavaScript 文件：`application/javascript` 或 `text/javascript`
- 不能是：`application/octet-stream`、`text/plain` 等

### 構建配置

項目使用 `vite.config.serveravatar.js` 進行構建：
- `base: '/'` - 根路徑，適用於 ServerAvatar
- 自動複製 `.htaccess` 到 `dist` 目錄
- 生成帶 hash 的文件名以實現緩存清除

