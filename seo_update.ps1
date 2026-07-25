$domain = "https://nahidjb1.github.io/One-Step"
$uniDir = "C:\Users\User\Desktop\Projects\One-Step\Universities"
$feesDir = "C:\Users\User\Desktop\Projects\One-Step\Fees_Chart"

# Update Universities Details Pages
$uniFiles = Get-ChildItem -Path $uniDir -Filter "*-details.html"
foreach ($file in $uniFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match '<title>(.*?)\s*\|.*?</title>') {
        $uniName = $matches[1]
        
        $newTitle = "$uniName Ranking, Campus & Programs | One-Step"
        $newDesc = "Explore $uniName global ranking, available faculties, and campus life. Apply directly as an international or local student."
        
        $schema = @"
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollegeOrUniversity",
  "name": "$uniName",
  "url": "$domain/Universities/$($file.Name)"
}
</script>
"@
        
        $newMetaBlock = @"
  <title>$newTitle</title>
  <meta name="description" content="$newDesc">
  <meta property="og:title" content="$newTitle">
  <meta property="og:description" content="$newDesc">
  <meta property="og:type" content="website">
  $schema
"@

        $content = $content -replace '(?s)\s*<title>.*?</title>\s*', "`r`n  <title>__TEMP__</title>`r`n"
        $content = $content -replace '(?s)\s*<meta name="description".*?>\s*', "`r`n"
        $content = $content -replace '  <title>__TEMP__</title>', $newMetaBlock
        
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    }
}

# Update Fees Chart Pages
$feeFiles = Get-ChildItem -Path $feesDir -Filter "*-fees.html"
foreach ($file in $feeFiles) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match '<title>(.*?)\s*[-|\|].*?</title>') {
        $uniName = $matches[1]
        
        $newTitle = "$uniName Fees Structure & International Tuition | One-Step"
        $newDesc = "Complete $uniName fees structure per semester. View exact tuition fees for local and international students, including Bangladeshi students."
        
        $schema = @"
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is the fee structure for international students at $uniName?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "The exact fee structure for international students at $uniName varies by program. Please check our detailed breakdown per semester."
    }
  }]
}
</script>
"@

        $newMetaBlock = @"
  <title>$newTitle</title>
  <meta name="description" content="$newDesc">
  <meta property="og:title" content="$newTitle">
  <meta property="og:description" content="$newDesc">
  <meta property="og:type" content="website">
  $schema
"@
        $content = $content -replace '(?s)\s*<title>.*?</title>\s*', "`r`n  <title>__TEMP__</title>`r`n"
        $content = $content -replace '(?s)\s*<meta name="description".*?>\s*', "`r`n"
        $content = $content -replace '  <title>__TEMP__</title>', $newMetaBlock
        
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    }
}

Write-Host "Done SEO Bulk Update!"
