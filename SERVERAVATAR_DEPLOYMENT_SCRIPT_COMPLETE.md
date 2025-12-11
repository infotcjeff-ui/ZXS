# ServerAvatar 完整 Deployment Script（包含 React 安裝）

## 📝 Deployment Script（部署腳本）

在 ServerAvatar 的 **Deployment Script** 欄位中，輸入以下完整腳本：

### 完整版本（推薦，確保 React 和所有依賴正確安裝）

```bash
#!/bin/bash
set -e  # 遇到錯誤立即退出

echo "=========================================="
echo "ServerAvatar 部署腳本開始執行"
echo "=========================================="

# 步驟 1: 清理舊的 node_modules（可選，但推薦）
echo ""
echo "步驟 1: 清理舊的依賴..."
if [ -d "node_modules" ]; then
    echo "發現舊的 node_modules，正在清理..."
    rm -rf node_modules
    echo "✓ 已清理舊的 node_modules"
else
    echo "✓ 沒有舊的 node_modules 需要清理"
fi

# 步驟 2: 清理舊的構建文件（可選）
echo ""
echo "步驟 2: 清理舊的構建文件..."
if [ -d "dist" ]; then
    echo "發現舊的 dist 目錄，正在清理..."
    rm -rf dist
    echo "✓ 已清理舊的 dist 目錄"
else
    echo "✓ 沒有舊的 dist 目錄需要清理"
fi

# 步驟 3: 安裝所有依賴（包括 React）
echo ""
echo "步驟 3: 安裝所有依賴（包括 React、React DOM、Vite 等）..."
npm install

# 驗證關鍵依賴是否安裝
echo ""
echo "驗證關鍵依賴安裝..."
if [ ! -d "node_modules/react" ]; then
    echo "❌ ERROR: React 未正確安裝！"
    exit 1
fi
if [ ! -d "node_modules/react-dom" ]; then
    echo "❌ ERROR: React DOM 未正確安裝！"
    exit 1
fi
if [ ! -d "node_modules/vite" ]; then
    echo "❌ ERROR: Vite 未正確安裝！"
    exit 1
fi
echo "✓ React、React DOM 和 Vite 已正確安裝"

# 步驟 4: 構建 ServerAvatar 版本
echo ""
echo "步驟 4: 構建 ServerAvatar 版本..."
npm run build:serveravatar

# 步驟 5: 驗證構建輸出
echo ""
echo "步驟 5: 驗證構建輸出..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ ERROR: dist/index.html 未找到！"
    exit 1
fi
echo "✓ dist/index.html 存在"

if [ ! -d "dist/assets" ]; then
    echo "❌ ERROR: dist/assets 目錄未找到！"
    exit 1
fi
echo "✓ dist/assets 目錄存在"

# 檢查構建後的 JavaScript 文件
JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
if [ "$JS_COUNT" -eq 0 ]; then
    echo "❌ ERROR: 沒有找到構建後的 JavaScript 文件！"
    exit 1
fi
echo "✓ 找到 $JS_COUNT 個 JavaScript 文件"

# 檢查構建後的 CSS 文件
CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
if [ "$CSS_COUNT" -eq 0 ]; then
    echo "⚠️  警告: 沒有找到構建後的 CSS 文件"
else
    echo "✓ 找到 $CSS_COUNT 個 CSS 文件"
fi

# 步驟 6: 確保 .htaccess 被複製
echo ""
echo "步驟 6: 複製 .htaccess 文件..."
if [ -f ".htaccess" ]; then
    if [ ! -f "dist/.htaccess" ]; then
        cp .htaccess dist/.htaccess
        echo "✓ 已複製 .htaccess 到 dist"
    else
        echo "✓ .htaccess 已存在於 dist"
    fi
else
    echo "⚠️  警告: .htaccess 文件不存在"
fi

# 步驟 7: 顯示構建輸出摘要
echo ""
echo "=========================================="
echo "構建完成！構建輸出摘要："
echo "=========================================="
echo "構建目錄: dist/"
echo "文件列表:"
ls -lh dist/ | head -20
echo ""
echo "Assets 目錄:"
ls -lh dist/assets/ 2>/dev/null | head -10 || echo "Assets 目錄為空"
echo ""
echo "=========================================="
echo "✓ 部署腳本執行成功！"
echo "=========================================="
```

### 簡化版本（如果 ServerAvatar 自動清理）

如果 ServerAvatar 會自動清理，可以使用這個簡化版本：

```bash
#!/bin/bash
set -e

echo "開始部署..."

# 安裝所有依賴（包括 React）
echo "安裝依賴..."
npm install

# 驗證 React 是否安裝
if [ ! -d "node_modules/react" ]; then
    echo "ERROR: React 未安裝！"
    exit 1
fi

# 構建
echo "構建項目..."
npm run build:serveravatar

# 驗證構建輸出
if [ ! -f "dist/index.html" ]; then
    echo "ERROR: dist/index.html 未找到！"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "ERROR: dist/assets 目錄未找到！"
    exit 1
fi

# 複製 .htaccess
if [ -f ".htaccess" ] && [ ! -f "dist/.htaccess" ]; then
    cp .htaccess dist/.htaccess
fi

echo "構建完成！"
ls -la dist/
```

### 最簡版本（僅基本命令）

如果只需要基本功能：

```bash
# 安裝所有依賴（包括 React）
npm install

# 構建 ServerAvatar 版本
npm run build:serveravatar

# 複製 .htaccess
if [ -f ".htaccess" ] && [ ! -f "dist/.htaccess" ]; then
    cp .htaccess dist/.htaccess
fi
```

## 📦 依賴說明

`npm install` 會自動從 `package.json` 安裝以下依賴：

### 生產依賴（Production Dependencies）
- ✅ **react** (^19.2.0) - React 核心庫
- ✅ **react-dom** (^19.2.0) - React DOM 渲染
- ✅ **react-router-dom** (^7.10.1) - React 路由
- ✅ **cors** (^2.8.5) - CORS 支持
- ✅ **express** (^4.21.2) - Express 服務器
- ✅ **uuid** (^11.0.3) - UUID 生成

### 開發依賴（Dev Dependencies）
- ✅ **@vitejs/plugin-react** (^5.1.1) - Vite React 插件
- ✅ **vite** (^7.2.4) - Vite 構建工具
- ✅ **tailwindcss** (^3.4.14) - Tailwind CSS
- ✅ **autoprefixer** (^10.4.22) - CSS 自動前綴
- ✅ **postcss** (^8.5.6) - PostCSS
- ✅ 其他開發工具

## ⚠️ 重要提示

### 1. React 會自動安裝

**不需要單獨安裝 React！**
- `npm install` 會自動從 `package.json` 安裝所有依賴
- 包括 React、React DOM 和所有其他依賴

### 2. 必須使用 `build:serveravatar`

- ✅ **正確**：`npm run build:serveravatar`
  - 使用 `vite.config.serveravatar.js`
  - Base path: `/`（適合 ServerAvatar）
  
- ❌ **錯誤**：`npm run build`
  - 使用 `vite.config.js`
  - Base path: `/ZXS/`（適合 GitHub Pages）
  - 在 ServerAvatar 上會導致路徑錯誤

### 3. 輸出目錄必須是 `dist`

- ✅ **必須是**：`dist`
- ❌ **不能是**：`.`、`src` 或其他目錄

## 🔍 驗證安裝

部署完成後，在構建日誌中應該看到：

```
步驟 3: 安裝所有依賴（包括 React、React DOM、Vite 等）...
npm install
...
added 234 packages in 15s

驗證關鍵依賴安裝...
✓ React、React DOM 和 Vite 已正確安裝

步驟 4: 構建 ServerAvatar 版本...
npm run build:serveravatar
...
✓ built in 1.97s
```

## 📋 完整設置檢查清單

在 ServerAvatar 控制台中：

### Git 設置
- [ ] Provider: `Github`
- [ ] Repository: `infotcjeff-ui/ZXS`
- [ ] Branch: `main`

### 構建設置
- [ ] **Build Command**: `npm install && npm run build:serveravatar`
- [ ] **Output Directory**: `dist`（必須是 `dist`！）
- [ ] **Node Version**: `20` 或 `20.x`

### Deployment Script
- [ ] 已輸入上面的完整版本腳本

## 🆘 如果 React 仍然未安裝

### 檢查 1: 查看構建日誌

在 ServerAvatar 構建日誌中查看：
- [ ] `npm install` 是否成功執行？
- [ ] 是否看到 "added XXX packages"？
- [ ] 是否有任何錯誤信息？

### 檢查 2: 驗證 package.json

確認 `package.json` 包含：
- [ ] `"react": "^19.2.0"`
- [ ] `"react-dom": "^19.2.0"`

### 檢查 3: 手動驗證

如果問題仍然存在，可以在 Deployment Script 中添加：

```bash
# 手動驗證 React 安裝
echo "檢查 React 安裝..."
npm list react react-dom
```

## 💡 關鍵要點

1. **React 會通過 `npm install` 自動安裝**
   - 不需要單獨安裝
   - `package.json` 已經包含所有依賴

2. **使用完整的 Deployment Script**
   - 包含依賴驗證
   - 包含構建驗證
   - 確保所有步驟成功

3. **Output Directory 必須是 `dist`**
   - 這是最關鍵的設置
   - 確保部署構建後的文件，而不是源文件

