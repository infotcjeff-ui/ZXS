# GitHub Pages - Deploy from a Branch 設置指南

## 設置步驟

### 1. 進入 GitHub 倉庫設置
- 訪問：`https://github.com/infotcjeff-ui/ZXS/settings/pages`
- 或：倉庫 → `Settings` → `Pages`

### 2. 選擇 Source
在 "Build and deployment" 部分：
- **Source:** 選擇 `Deploy from a branch`
- **Branch:** 選擇 `main`（或您的默認分支）
- **Folder:** 選擇 `/ (root)` 或 `/docs`

### 3. 保存設置
- 點擊 "Save" 按鈕
- 等待 GitHub Pages 部署完成（通常需要 1-2 分鐘）

## 重要提示

⚠️ **使用 "Deploy from a branch" 的限制：**
1. 需要手動構建並提交 `dist` 文件夾到倉庫
2. 或者需要將構建文件放在指定文件夾（如 `docs`）
3. 無法自動構建，需要手動運行 `npm run build` 並提交

**推薦使用 "GitHub Actions"**（當前設置）：
- ✅ 自動構建項目
- ✅ 使用正確的 base path (`/ZXS/`)
- ✅ 部署優化後的文件
- ✅ 無需手動操作

## 如果必須使用 "Deploy from a branch"

### 設置步驟

1. **進入 GitHub 倉庫設置**
   - 訪問：`https://github.com/infotcjeff-ui/ZXS/settings/pages`
   - 或：倉庫 → Settings → Pages

2. **選擇 Source**
   - 在 "Build and deployment" 部分
   - **Source:** 選擇 `Deploy from a branch`
   - **Branch:** 選擇 `main` 或 `master`
   - **Folder:** 選擇 `/ (root)` 或 `/docs`（如果使用 docs 文件夾）

3. **保存設置**
   - 點擊 "Save" 按鈕

### 注意事項

如果使用 "Deploy from a branch"：
- 需要手動構建並提交 `dist` 文件夾
- 或者將構建文件放在 `docs` 文件夾中
- 需要修改 `vite.config.js` 的 `base` 設置

### 推薦方案：使用 GitHub Actions（當前設置）

當前項目已配置 GitHub Actions 自動部署：

1. **進入 GitHub 倉庫設置**
   - 訪問：`https://github.com/infotcjeff-ui/ZXS/settings/pages`

2. **選擇 Source**
   - **Source:** 選擇 `GitHub Actions`
   - 這會使用 `.github/workflows/deploy.yml` 自動構建和部署

3. **優勢**
   - ✅ 自動構建
   - ✅ 使用正確的 base path (`/ZXS/`)
   - ✅ 自動緩存清除
   - ✅ 構建優化

## 修復關聯用戶顯示問題

如果刷新後仍然顯示"暫無關聯用戶"，請檢查：

1. **檢查數據是否正確保存**
   - 打開瀏覽器開發者工具（F12）
   - 查看 Console 標籤
   - 應該看到調試日誌顯示 `relatedUserIds`

2. **檢查後端數據**
   - 檢查 `data/data.json` 文件
   - 確認公司的 `relatedUserIds` 字段存在且為數組

3. **檢查用戶數據**
   - 確認 `data/users.json` 中有用戶數據
   - 確認用戶 ID 與 `relatedUserIds` 中的 ID 匹配

4. **清除緩存**
   - 按 Ctrl+Shift+R（Windows）或 Cmd+Shift+R（Mac）強制刷新
   - 或清除瀏覽器緩存

## 調試步驟

1. **打開瀏覽器控制台（F12）**
2. **查看 Network 標籤**
   - 找到 `/api/companies/:id` 請求
   - 檢查響應中的 `relatedUserIds` 字段
3. **查看 Console 標籤**
   - 應該看到調試日誌：
     - `Company data:`
     - `Users data:`
     - `Company relatedUserIds:`
     - `Filtered relatedUsers:`

如果 `relatedUserIds` 存在但 `Filtered relatedUsers` 為空，可能是：
- 用戶 ID 不匹配
- 用戶數據未正確加載

