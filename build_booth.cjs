const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const rootDir = __dirname;
  const distDir = path.join(rootDir, 'dist');
  const releaseDir = path.join(rootDir, 'booth_release');
  const targetFolderName = '料理分量らくらく計算ツール';
  const targetDir = path.join(releaseDir, targetFolderName);
  const appDir = path.join(targetDir, 'app');
  const zipPath = path.join(releaseDir, `${targetFolderName}_v1.0.0.zip`);

  console.log('[1/5] クリーンアップとフォルダ作成...');
  if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
  }
  fs.mkdirSync(appDir, { recursive: true });

  console.log('[2/5] アプリケーション本体のコピー...');
  copyDirRecursive(distDir, appDir);

  console.log('[3/5] LICENSE.txt の配置...');
  fs.copyFileSync(path.join(rootDir, 'LICENSE'), path.join(targetDir, 'LICENSE.txt'));

  console.log('[4/5] ツール起動.bat および はじめにお読みください.txt の生成 (Shift-JIS)...');

  const batContent = `@echo off
chcp 932 >nul
title 料理分量らくらく計算ツール

echo ========================================================
echo   料理分量らくらく計算ツール を起動しています...
echo ========================================================
echo.
echo ブラウザが自動的に開きます。
echo 終了する場合は、このウィンドウを閉じるか [Ctrl+C] を押してください。
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = 8192; $root = Join-Path $PSScriptRoot 'app'; if (-not (Test-Path $root)) { $root = $PSScriptRoot }; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add(\\"http://localhost:$port/\\"); try { $listener.Start() } catch { $port = 8193; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add(\\"http://localhost:$port/\\"); $listener.Start(); }; Start-Process \\"http://localhost:$port/\\"; while ($listener.IsListening) { $context = $listener.GetContext(); $reqPath = $context.Request.Url.LocalPath.TrimStart('/'); if ([string]::IsNullOrEmpty($reqPath) -or $reqPath -eq '/') { $reqPath = 'index.html' }; $filePath = Join-Path $root $reqPath; if (Test-Path $filePath -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($filePath); $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); $mime = switch ($ext) { '.html' { 'text/html; charset=utf-8' } '.js' { 'application/javascript; charset=utf-8' } '.css' { 'text/css; charset=utf-8' } '.svg' { 'image/svg+xml' } '.png' { 'image/png' } '.gif' { 'image/gif' } '.json' { 'application/json' } default { 'application/octet-stream' } }; $context.Response.ContentType = $mime; $context.Response.ContentLength64 = $bytes.Length; $context.Response.OutputStream.Write($bytes, 0, $bytes.Length); } else { $context.Response.StatusCode = 404; }; $context.Response.OutputStream.Close(); }"
`;

  const readmeContent = `======================================================================
  料理分量らくらく計算ツール (CookScale)  v1.0.0
======================================================================

この度はお買い上げ・ダウンロードいただき誠にありがとうございます。
本ツールは、レシピの人数・分量を料理中に使いやすい形へ瞬時に換算・整形する
ブラウザ完結型の計算ツールです。

----------------------------------------------------------------------
■ 起動方法
----------------------------------------------------------------------
1. ダウンロードした ZIP ファイルを展開（解凍）します。
2. フォルダ内にある「ツール起動.bat」をダブルクリックしてください。
3. 自動的にブラウザが立ち上がり、ツールをご利用いただけます。

※ 起動中は黒い画面（コマンドプロンプト）が開いたままになります。
   終了する際は、ブラウザおよび黒い画面を閉じてください。
※ Node.jsやPython等の外部ソフトのインストールは一切不要です。

----------------------------------------------------------------------
■ 主な機能・特徴
----------------------------------------------------------------------
・レシピ一括貼り付け：材料リストをそのまま貼り付けるだけで自動解析
・人数倍率自動計算：作りたい人数（例: 2人分 -> 5人分）に合わせて即時再計算
・計量形式への自動整形：大さじ・小さじの組み合わせ（例: 大さじ1＋小さじ1.5）へ最適化
・非数値表現の保持：「少々」「適量」「お好みで」等のニュアンスを崩さず維持
・ワンクリックコピー：計算後の材料一覧を簡単にクリップボードへコピー
・お気に入り保存：よく作るレシピをお手元のブラウザ（localStorage）に保存可能
・完全ローカル・オフライン動作：外部サーバーへの通信は一切行わず安全です

----------------------------------------------------------------------
■ 動作環境
----------------------------------------------------------------------
・OS: Windows 10 / Windows 11
・対応ブラウザ: Google Chrome, Microsoft Edge, Mozilla Firefox, Brave 等

----------------------------------------------------------------------
■ フォルダ構成
----------------------------------------------------------------------
料理分量らくらく計算ツール/
├── ツール起動.bat               … ツール起動用バッチファイル
├── はじめにお読みください.txt     … 本ドキュメント
├── LICENSE.txt                  … MITライセンス規約
└── app/                         … ツール本体（プログラムファイル群）

----------------------------------------------------------------------
■ ライセンス・免責事項
----------------------------------------------------------------------
本ソフトウェアは MIT License のもとで提供されます。
詳細は同封の「LICENSE.txt」をご確認ください。

本ツールの使用によって生じたいかなる損害についても、
開発者は一切の責任を負いかねますのであらかじめご了承ください。
======================================================================
`;

  // Write temporary files in UTF-8
  const tempBatPath = path.join(releaseDir, 'temp_bat.txt');
  const tempReadmePath = path.join(releaseDir, 'temp_readme.txt');
  fs.writeFileSync(tempBatPath, batContent, 'utf8');
  fs.writeFileSync(tempReadmePath, readmeContent, 'utf8');

  const finalBatPath = path.join(targetDir, 'ツール起動.bat');
  const finalReadmePath = path.join(targetDir, 'はじめにお読みください.txt');

  // Convert to Shift-JIS (CP932) via PowerShell script with BOM
  const convertScript = `
    $sjis = [System.Text.Encoding]::GetEncoding(932);
    $utf8 = [System.Text.Encoding]::UTF8;
    
    $batText = [System.IO.File]::ReadAllText('${tempBatPath.replace(/\\/g, '\\\\')}', $utf8);
    [System.IO.File]::WriteAllText('${finalBatPath.replace(/\\/g, '\\\\')}', $batText, $sjis);
    
    $readmeText = [System.IO.File]::ReadAllText('${tempReadmePath.replace(/\\/g, '\\\\')}', $utf8);
    [System.IO.File]::WriteAllText('${finalReadmePath.replace(/\\/g, '\\\\')}', $readmeText, $sjis);
  `;

  const scriptWithBom = '\uFEFF' + convertScript;
  const tempPs1Path = path.join(releaseDir, 'convert.ps1');
  fs.writeFileSync(tempPs1Path, scriptWithBom, 'utf8');

  execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tempPs1Path}"`, { stdio: 'inherit' });

  // Cleanup temp files
  fs.rmSync(tempBatPath, { force: true });
  fs.rmSync(tempReadmePath, { force: true });
  fs.rmSync(tempPs1Path, { force: true });

  console.log('[5/5] ZIPアーカイブの生成...');
  const zipScript = `
    Compress-Archive -Path '${targetDir.replace(/\\/g, '\\\\')}' -DestinationPath '${zipPath.replace(/\\/g, '\\\\')}' -Force;
  `;
  const zipScriptWithBom = '\uFEFF' + zipScript;
  const tempZipPs1Path = path.join(releaseDir, 'zip.ps1');
  fs.writeFileSync(tempZipPs1Path, zipScriptWithBom, 'utf8');

  execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tempZipPs1Path}"`, { stdio: 'inherit' });
  fs.rmSync(tempZipPs1Path, { force: true });

  console.log('==========================================');
  console.log(`ZIPパッケージ作成完了: ${zipPath}`);
  console.log('==========================================');
} catch (err) {
  console.error('ERROR OCCURRED:', err.message, err.stack);
  process.exit(1);
}
