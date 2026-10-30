<?php
// Local PHP built-in-server routing for the extensionless application page.
if (parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) === '/apply') {
    require __DIR__ . '/../apply.php';
    return true;
}
return false;
