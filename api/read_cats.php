<?php
$data = json_decode(file_get_contents(__DIR__ . '/../data/fees_data.json'), true);
if (isset($data['city-university']['categories'])) {
    foreach ($data['city-university']['categories'] as $c) {
        echo $c['name'] . "\n";
    }
}
