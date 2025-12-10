@echo off
echo 正在修復 Git commit 卡住問題...

REM Set Git editor to a non-interactive command
git config --global core.editor "true"

REM Verify the setting
git config --global --get core.editor

echo.
echo 修復完成！現在使用 'git commit -m "message"' 應該不會卡住了。
echo.
pause

