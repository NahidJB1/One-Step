$json = Get-Content "C:\Users\User\Desktop\Projects\One-Step\data\fees_data.json" -Raw | ConvertFrom-Json
$dict = [ordered]@{}

foreach ($item in $json) {
    $props = $item.PSObject.Properties
    
    if ($props.Match('id').Count -gt 0 -and $item.id -is [string]) {
        $dict[$item.id] = $item
    } else {
        foreach ($prop in $props) {
            $key = $prop.Name
            $value = $prop.Value
            $dict[$key] = $value
        }
    }
}

$dict | ConvertTo-Json -Depth 20 | Set-Content "C:\Users\User\Desktop\Projects\One-Step\data\fees_data.json" -Encoding UTF8
Write-Host "Fixed JSON structure!"
