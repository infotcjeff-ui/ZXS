# Git Commit 卡住問題解決方案

## 問題描述
使用 `git commit -m "message"` 時經常會卡住，只能取消。

## 原因
Git 試圖打開編輯器來編輯提交訊息，但編輯器無法正常打開或配置不正確。

## 解決方案

### 方案 1：設置 Git 編輯器為非交互式（推薦）

在 PowerShell 中執行：
```powershell
git config --global core.editor "notepad"
```

或者使用 `true`（如果可用）：
```powershell
git config --global core.editor "true"
```

### 方案 2：使用環境變量

在 PowerShell 中設置：
```powershell
$env:GIT_EDITOR = "notepad"
```

### 方案 3：使用提供的腳本

運行修復腳本：
```powershell
.\fix-git-commit.ps1
```

或使用批處理文件：
```cmd
fix-git-commit.bat
```

## 驗證設置

檢查當前配置：
```powershell
git config --global --get core.editor
```

應該顯示：`notepad` 或 `true`

## 注意事項

1. **使用 `-m` 參數時**：如果使用 `git commit -m "message"`，Git 不應該打開編輯器，但如果配置錯誤可能會嘗試打開。

2. **不使用 `-m` 參數時**：如果直接使用 `git commit`（沒有 `-m`），Git 會打開編輯器。設置為 `notepad` 後，會打開記事本讓您編輯提交訊息。

3. **永久設置**：使用 `--global` 標誌會將設置應用到所有 Git 倉庫。

4. **僅當前倉庫**：如果只想為當前倉庫設置，使用 `--local` 而不是 `--global`：
   ```powershell
   git config --local core.editor "notepad"
   ```

## 測試

執行以下命令測試是否修復：
```powershell
git status
git add .
git commit -m "測試提交"
```

如果不再卡住，說明問題已解決。

