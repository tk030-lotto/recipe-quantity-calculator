@echo off
setlocal
chcp 932 >nul
title 料理分量らくらく計算（ローカル起動）
cd /d "%~dp0"
set "PORT=8765"

where python >nul 2>nul
if %errorlevel%==0 goto :use_python
where py >nul 2>nul
if %errorlevel%==0 goto :use_py

echo.
echo [案内] このPCには Python が見つかりませんでした。
echo このツールをローカルで動かすには、簡易サーバーが必要です。
echo 代わりに、公開ページをブラウザで開きます（インターネット接続が必要です）。
echo.
start "" "https://zero-dev.jp/recipe-quantity-calculator/"
pause
exit /b 0

:use_python
set "PY=python"
goto :serve

:use_py
set "PY=py"

:serve
echo.
echo ローカルサーバーを起動します（別ウィンドウ）。
start "CookScale ローカルサーバー" /min %PY% -m http.server %PORT%
timeout /t 2 >nul
start "" "http://localhost:%PORT%/"
echo.
echo ブラウザで http://localhost:%PORT%/ を開きました。
echo 終了するときは、最小化された「CookScale ローカルサーバー」の画面を閉じてください。
echo.
pause
