@echo off
setlocal
chcp 932 > nul
title 料理分量らくらく計算ツール
cd /d "%~dp0"

echo ========================================================
echo   料理分量らくらく計算ツール の起動準備を行っています...
echo ========================================================
echo.

:: 1. Node.js の確認
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [エラー] Node.js が見つかりません。
    echo 公式サイト（https://nodejs.org/）からインストールしてください。
    echo.
    pause
    exit /b 1
)

:: 2. 初回のみ依存関係インストール
if not exist "node_modules" (
    echo [初回準備] 必要なライブラリをインストールしています...
    call npm install
    if %errorlevel% neq 0 (
        echo [エラー] インストールに失敗しました。
        pause
        exit /b 1
    )
)

:: 3. サーバー起動＆ブラウザオープン
echo サーバーを起動しています...
echo ブラウザが自動的に開きます。
echo 終了する場合は [Ctrl+C] を押すか、この画面を閉じてください。
echo.

call npm run dev -- --open
pause
