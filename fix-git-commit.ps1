# Fix Git commit hanging issue
# This script configures Git to not open an editor when using -m flag

Write-Host "正在修復 Git commit 卡住問題..." -ForegroundColor Yellow

# Set Git editor to a non-interactive command
git config --global core.editor "true"

# Alternative: Use notepad (Windows default editor)
# git config --global core.editor "notepad"

# Verify the setting
$editor = git config --global --get core.editor
Write-Host "Git 編輯器已設置為: $editor" -ForegroundColor Green

# Also set GIT_EDITOR environment variable for current session
$env:GIT_EDITOR = "true"

Write-Host ""
Write-Host "修復完成！現在使用 'git commit -m \"message\"' 應該不會卡住了。" -ForegroundColor Green
Write-Host "如果問題仍然存在，請重新啟動終端。" -ForegroundColor Yellow

