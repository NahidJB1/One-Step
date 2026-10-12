# Compatibility entry point. Keep ranking facts and visible fee data intact.
& node (Join-Path $PSScriptRoot 'scripts\build_site_seo.js') @args
exit $LASTEXITCODE
