# PowerShell 自動化測試腳本
param(
    [string]$TestType = "all",
    [string]$ServerPort = "3000",
    [switch]$StartServer = $false,
    [switch]$StopServer = $false
)

Write-Host "🧪 租屋經驗分享地圖 - 自動化測試腳本" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# 函數：檢查伺服器是否運行
function Test-ServerRunning {
    param([string]$Port = "3000")
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/rentals" -TimeoutSec 5 -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# 函數：啟動伺服器
function Start-TestServer {
    Write-Host "🚀 啟動測試伺服器..." -ForegroundColor Yellow
    
    if (Test-ServerRunning -Port $ServerPort) {
        Write-Host "✅ 伺服器已在運行" -ForegroundColor Green
        return
    }
    
    # 在背景啟動伺服器
    $serverProcess = Start-Process node -ArgumentList "server.js" -WindowStyle Hidden -PassThru
    
    # 等待伺服器啟動
    $maxAttempts = 10
    $attempt = 0
    
    do {
        Start-Sleep -Seconds 2
        $attempt++
        Write-Host "⏳ 等待伺服器啟動... ($attempt/$maxAttempts)" -ForegroundColor Yellow
    } while (-not (Test-ServerRunning -Port $ServerPort) -and $attempt -lt $maxAttempts)
    
    if (Test-ServerRunning -Port $ServerPort) {
        Write-Host "✅ 伺服器啟動成功" -ForegroundColor Green
        return $serverProcess
    } else {
        Write-Host "❌ 伺服器啟動失敗" -ForegroundColor Red
        exit 1
    }
}

# 函數：停止伺服器
function Stop-TestServer {
    Write-Host "🛑 停止測試伺服器..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ 伺服器已停止" -ForegroundColor Green
}

# 函數：執行 Node.js 測試
function Run-NodeTests {
    Write-Host "📋 執行 Node.js 自動化測試..." -ForegroundColor Yellow
    
    # 檢查是否需要安裝依賴
    if (-not (Test-Path "node_modules/axios")) {
        Write-Host "📦 安裝測試依賴..." -ForegroundColor Yellow
        npm install axios colors --save-dev
    }
    
    node test-api.js
}

# 函數：執行 Jest 測試
function Run-JestTests {
    Write-Host "🃏 執行 Jest 測試..." -ForegroundColor Yellow
    
    # 檢查是否需要安裝 Jest
    if (-not (Test-Path "node_modules/jest")) {
        Write-Host "📦 安裝 Jest 依賴..." -ForegroundColor Yellow
        npm install jest supertest --save-dev
    }
    
    npx jest tests/api.test.js --verbose
}

# 函數：執行 Postman 測試
function Run-PostmanTests {
    Write-Host "📮 執行 Postman 測試..." -ForegroundColor Yellow
    
    # 檢查是否安裝了 Newman
    try {
        newman --version | Out-Null
    }
    catch {
        Write-Host "📦 安裝 Newman..." -ForegroundColor Yellow
        npm install -g newman
    }
    
    newman run postman-collection.json --reporters cli,json --reporter-json-export test-results.json
}

# 函數：生成測試報告
function Generate-TestReport {
    Write-Host "📊 生成測試報告..." -ForegroundColor Yellow
    
    $reportPath = "test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>API 測試報告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>租屋經驗分享地圖 - API 測試報告</h1>
        <p>生成時間: $(Get-Date)</p>
    </div>
    
    <div class="section">
        <h2>測試摘要</h2>
        <p>測試類型: $TestType</p>
        <p>伺服器端口: $ServerPort</p>
        <p>測試狀態: 完成</p>
    </div>
    
    <div class="section">
        <h2>測試結果</h2>
        <p>詳細結果請查看控制台輸出</p>
    </div>
</body>
</html>
"@
    
    $html | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "✅ 測試報告已生成: $reportPath" -ForegroundColor Green
}

# 主要執行邏輯
try {
    # 啟動伺服器（如果需要）
    if ($StartServer) {
        $serverProcess = Start-TestServer
    }
    
    # 確保伺服器正在運行
    if (-not (Test-ServerRunning -Port $ServerPort)) {
        Write-Host "❌ 伺服器未運行，請先啟動伺服器或使用 -StartServer 參數" -ForegroundColor Red
        exit 1
    }
    
    # 根據測試類型執行測試
    switch ($TestType.ToLower()) {
        "node" { Run-NodeTests }
        "jest" { Run-JestTests }
        "postman" { Run-PostmanTests }
        "all" {
            Run-NodeTests
            Write-Host ""
            Run-JestTests
            Write-Host ""
            Run-PostmanTests
        }
        default {
            Write-Host "❌ 未知的測試類型: $TestType" -ForegroundColor Red
            Write-Host "可用選項: node, jest, postman, all" -ForegroundColor Yellow
            exit 1
        }
    }
    
    # 生成測試報告
    Generate-TestReport
    
    Write-Host ""
    Write-Host "🎉 測試完成!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ 測試執行失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # 停止伺服器（如果需要）
    if ($StopServer -and $serverProcess) {
        Stop-TestServer
    }
}

Write-Host ""
Write-Host "使用方法:" -ForegroundColor Cyan
Write-Host "  .\test-runner.ps1 -TestType all -StartServer -StopServer" -ForegroundColor Gray
Write-Host "  .\test-runner.ps1 -TestType node" -ForegroundColor Gray
Write-Host "  .\test-runner.ps1 -TestType jest" -ForegroundColor Gray
Write-Host "  .\test-runner.ps1 -TestType postman" -ForegroundColor Gray