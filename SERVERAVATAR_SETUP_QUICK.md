# ServerAvatar 快速設置指南

## Git 部署設置

在 ServerAvatar 的 "Git Deployment" 頁面中，請輸入以下信息：

### 1. Provider（提供者）
```
Github
```
或選擇 GitHub 圖標

### 2. Repository（倉庫）
```
infotcjeff-ui/ZXS
```
格式：`用戶名/倉庫名`

### 3. Branch（分支）
```
main
```
如果您的默認分支是 `master`，則輸入 `master`

### 4. Build Command（構建命令）
```
npm run build:serveravatar
```

### 5. Output Directory（輸出目錄）
```
dist
```

### 6. Node Version（Node 版本）
```
20
```
或 `20.x`

## 完整設置步驟

1. **進入 ServerAvatar 應用設置**
   - 找到 "Git Deployment" 選項

2. **連接 GitHub 倉庫**
   - Provider: `Github`
   - Repository: `infotcjeff-ui/ZXS`
   - Branch: `main`

3. **配置構建設置**
   - Build Command: `npm run build:serveravatar`
   - Output Directory: `dist`
   - Node Version: `20`

4. **保存並部署**
   - 點擊 "Save" 或 "Deploy"
   - 等待部署完成（2-5 分鐘）

5. **驗證部署**
   - 訪問您的應用 URL
   - 檢查控制台，應該看到 `Detected base path: /`

## 注意事項

- ✅ 必須使用 `npm run build:serveravatar` 而不是 `npm run build`
- ✅ 輸出目錄必須是 `dist`
- ✅ 確保 Node 版本是 20 或更高

