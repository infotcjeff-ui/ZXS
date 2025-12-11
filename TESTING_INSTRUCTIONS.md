# 測試說明

## 1. 修復 Git Commit 卡住問題

已設置 Git 編輯器為 `notepad`，現在 `git commit -m` 應該不會卡住了。

如果仍然卡住，請運行：
```powershell
git config --global core.editor "notepad"
```

## 2. 清除 localStorage 中的圖片數據

### 方法 1：使用清除工具（推薦）

1. 在瀏覽器中打開 `clear-company-images.html`
2. 點擊「檢查當前數據」查看當前狀態
3. 點擊「清除所有圖片」移除所有公司的圖片數據（保留其他信息）
4. 或點擊「清除所有公司數據」完全清除所有公司

### 方法 2：使用瀏覽器控制台

1. 打開瀏覽器控制台（F12）
2. 運行以下代碼：

```javascript
// 清除所有公司的圖片數據
const companies = JSON.parse(localStorage.getItem('zxs-companies') || '[]');
companies.forEach(company => {
  company.media = [];
  company.gallery = [];
});
localStorage.setItem('zxs-companies', JSON.stringify(companies));
console.log('✅ 已清除所有圖片數據');
window.dispatchEvent(new Event('companies:update'));
```

## 3. 測試創建新公司

### 步驟：

1. **清除圖片數據**（使用上述方法）

2. **登入系統**
   - 使用管理員帳號：`admin@zxsgit.local` / `admin321`
   - 或使用任何已註冊的帳號

3. **導航到新增公司頁面**
   - 點擊導航欄的「公司」
   - 點擊「新增公司」按鈕
   - 或直接訪問 `/companies/new`

4. **填寫所有字段**：
   - **標題***：`測試公司 Test Company`
   - **地址**：`香港九龍尖沙咀測試街道123號`
   - **描述**：`這是一個測試公司的完整描述，包含所有字段和圖片。`
   - **電話**：`+852 1234 5678`
   - **網站**：`https://test-company.example.com`
   - **備註**：`這是測試備註信息。`
   - **關聯用戶**：選擇至少一個用戶（可多選）

5. **上傳圖片**：
   - **主圖片**：上傳 1 張圖片（會自動設為主圖）
   - **圖庫**：上傳最多 5 張圖片（建議上傳 3-5 張測試）

6. **提交表單**：
   - 點擊「建立公司」按鈕
   - 應該看到成功消息
   - 自動導航到公司列表頁面

7. **驗證結果**：
   - 檢查公司列表是否顯示新公司
   - 點擊公司查看詳情頁
   - 確認所有字段都正確顯示
   - 確認圖片正確顯示（主圖和圖庫）

### 使用測試腳本（可選）

如果想快速創建測試數據，可以在瀏覽器控制台運行：

```javascript
// 複製 test-company-creation.js 的內容到控制台
// 然後運行：
createTestCompany()
```

這會創建一個包含所有字段和虛擬圖片的測試公司。

## 4. 檢查控制台日誌

在測試過程中，打開瀏覽器控制台（F12）查看詳細日誌：

- `Submitting company update with:` - 提交的數據
- `createCompany: Starting with payload:` - 創建過程
- `Saving companies to localStorage, total size:` - 保存的數據大小
- `Verified: Saved companies count:` - 驗證結果

## 5. 常見問題

### 問題：仍然顯示「儲存空間不足」
- **解決方案**：確保已清除舊的圖片數據
- 檢查控制台是否有 `QuotaExceededError`
- 如果問題持續，嘗試清除所有公司數據重新開始

### 問題：圖片上傳後沒有顯示
- **解決方案**：檢查圖片是否被正確壓縮
- 查看控制台是否有錯誤信息
- 確認圖片格式是否正確（JPG, PNG 等）

### 問題：公司創建後沒有出現在列表
- **解決方案**：刷新頁面或檢查 `companies:update` 事件是否觸發
- 查看控制台日誌確認保存是否成功

## 6. 驗證清單

- [ ] 已清除舊的圖片數據
- [ ] 可以成功創建新公司
- [ ] 所有文本字段正確保存
- [ ] 主圖片正確上傳和顯示
- [ ] 圖庫圖片正確上傳和顯示（最多 5 張）
- [ ] 關聯用戶正確保存和顯示
- [ ] 公司詳情頁面正確顯示所有信息
- [ ] Dashboard 正確顯示已連接的公司
- [ ] 沒有 localStorage 配額錯誤
- [ ] 圖片已正確壓縮（檢查數據大小）


