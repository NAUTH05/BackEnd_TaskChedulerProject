# Script to remove comments from JavaScript files

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

            # Remove single-line comments (but preserve URLs with //)
            # This regex matches // comments but not http:// or https://
            $content = $content -replace '(?<!:)//(?!/)[^\r\n]*', ''

            # Remove multi-line comments /* ... */
            $content = $content -replace '/\*[\s\S]*?\*/', ''

            # Remove empty lines that result from comment removal
            $content = $content -replace '(?m)^\s*$(\r?\n)', ''

            # Remove multiple consecutive blank lines, keep only one
            $content = $content -replace '(\r?\n){3,}', "`n`n"

            # Save the cleaned content
            Set-Content -Path $fullPath -Value $content -NoNewline

            Write-Host "  ✓ Completed" -ForegroundColor Green
            $processedCount++
        }
        catch {
            Write-Host "  ✗ Error: $_" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "  ⚠ File not found: $fullPath" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Processed: $processedCount files" -ForegroundColor Green
Write-Host "  Errors: $errorCount files" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
