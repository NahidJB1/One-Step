$oldDomain = "https://nahidjb1.github.io/One-Step"
$newDomain = "https://www.onestepmy.com"

# Root files
$rootFiles = @("C:\Users\User\Desktop\Projects\One-Step\sitemap.xml", "C:\Users\User\Desktop\Projects\One-Step\robots.txt", "C:\Users\User\Desktop\Projects\One-Step\index.html")

foreach ($file in $rootFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace [regex]::Escape($oldDomain), $newDomain
        Set-Content -Path $file -Value $content -Encoding UTF8
    }
}

# Universities and Fees_Chart
$htmlFiles = Get-ChildItem -Path "C:\Users\User\Desktop\Projects\One-Step" -Include "*.html" -Recurse | Where-Object { $_.FullName -match "Universities|Fees_Chart" }

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match [regex]::Escape($oldDomain)) {
        $content = $content -replace [regex]::Escape($oldDomain), $newDomain
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    }
}

Write-Host "Domain updated to $newDomain in all files!"
