$files = @(
    "Public\TaskAPI.js",
    "Public\ProjectAPI.js",
    "Public\ProjectMemberAPI.js",
    "Public\CommentAPI.js",
    "Public\NotificationAPI.js",
    "Public\userAPI.js",
    "Public\models\User.js",
    "Public\models\Project.js",
    "Public\models\Task.js",
    "Public\models\TaskAssignment.js",
    "Public\models\ProjectMember.js",
    "Public\models\Comment.js",
    "Public\models\Notification.js",
    "middleware\authMiddleware.js",
    "middleware\projectPermission.js",
    "middleware\taskPermission.js",
    "middleware\commentPermission.js",
    "services\NotificationHelper.js",
    "services\CounterService.js",
    "config\firebase.js",
    "index.js"
)

$processedCount = 0
$errorCount = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file

    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow

        try {
            $content = Get-Content -Path $fullPath -Raw

            $content = $content -replace '(?<!:)//(?!/)[^\r\n]*', ''

            $content = $content -replace '/\*[\s\S]*?\*/', ''

            $content = $content -replace '(?m)^\s*$(\r?\n)', ''

            $newline = [System.Environment]::NewLine
            $content = $content -replace "($newline){3,}", "$newline$newline"

            Set-Content -Path $fullPath -Value $content -NoNewline

            Write-Host "  Completed" -ForegroundColor Green
            $processedCount++
        }
        catch {
            Write-Host "  Error: $_" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "  File not found: $fullPath" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Processed: $processedCount files" -ForegroundColor Green
Write-Host "  Errors: $errorCount files" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
