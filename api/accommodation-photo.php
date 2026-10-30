<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function googleKey(string $root): string {
    $key = trim((string)getenv('GOOGLE_MAPS_API_KEY'));
    if ($key !== '') return $key;
    $file = $root . '/.env.local';
    if (!is_file($file) || !is_readable($file)) return '';
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$name, $value] = array_map('trim', explode('=', $line, 2));
        if ($name === 'GOOGLE_MAPS_API_KEY') return trim($value, " \t\n\r\0\x0B\"'");
    }
    return '';
}

function googleJson(string $url, string $key, ?array $body = null, array $headers = []): array {
    $curl = curl_init($url);
    if ($curl === false) throw new RuntimeException('Unable to initialise request.');
    $requestHeaders = array_merge(['Accept: application/json', 'X-Goog-Api-Key: ' . $key], $headers);
    $options = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => $requestHeaders,
    ];
    if ($body !== null) {
        $options[CURLOPT_POST] = true;
        $options[CURLOPT_POSTFIELDS] = json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $requestHeaders[] = 'Content-Type: application/json';
        $options[CURLOPT_HTTPHEADER] = $requestHeaders;
    }
    curl_setopt_array($curl, $options);
    $raw = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $error = curl_error($curl);
    curl_close($curl);
    if ($raw === false || $error !== '' || $status < 200 || $status >= 300) {
        $failure = is_string($raw) ? json_decode($raw, true) : null;
        $reason = is_array($failure) ? trim((string)($failure['error']['status'] ?? '')) : '';
        throw new RuntimeException('Google Places request failed with HTTP ' . $status . ($reason !== '' ? ' (' . $reason . ')' : '') . ($error !== '' ? ' (' . $error . ')' : '') . '.');
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) throw new RuntimeException('Google Places returned invalid JSON.');
    return $decoded;
}

function cachedPlaceId(string $root, string $cacheKey): string {
    $path = $root . '/data/google_place_ids.local.json';
    if (!is_file($path) || !is_readable($path)) return '';
    $data = json_decode((string)file_get_contents($path), true);
    return is_array($data) ? trim((string)($data[$cacheKey] ?? '')) : '';
}

function storePlaceId(string $root, string $cacheKey, string $placeId): void {
    $path = $root . '/data/google_place_ids.local.json';
    $handle = @fopen($path, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) { if (is_resource($handle)) fclose($handle); return; }
    $raw = stream_get_contents($handle);
    $data = json_decode($raw ?: '{}', true);
    if (!is_array($data)) $data = [];
    $data[$cacheKey] = $placeId;
    ksort($data);
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL);
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') respond(405, ['error' => 'Method not allowed.']);
$root = dirname(__DIR__);
$university = strtolower(trim((string)($_GET['university'] ?? '')));
$propertyIndex = filter_var($_GET['property'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 20]]);
if (!preg_match('/^[a-z0-9-]{2,24}$/', $university) || $propertyIndex === false) respond(400, ['error' => 'Invalid property request.']);

$all = json_decode((string)file_get_contents($root . '/data/university_accommodation.json'), true);
$properties = is_array($all[$university]['properties'] ?? null) ? $all[$university]['properties'] : [];
if (!isset($properties[$propertyIndex]) || !is_array($properties[$propertyIndex])) respond(404, ['error' => 'Property not found.']);

$key = googleKey($root);
if ($key === '') respond(503, ['error' => 'Property photos are not configured.']);
$property = $properties[$propertyIndex];
$cacheKey = $university . ':' . $propertyIndex;

try {
    $placeId = cachedPlaceId($root, $cacheKey);
    if ($placeId === '') {
        $search = googleJson(
            'https://places.googleapis.com/v1/places:searchText',
            $key,
            ['textQuery' => $property['name'] . ', ' . $property['location'], 'languageCode' => 'en', 'regionCode' => 'MY', 'maxResultCount' => 1],
            ['X-Goog-FieldMask: places.id']
        );
        $placeId = trim((string)($search['places'][0]['id'] ?? ''));
        if ($placeId === '') respond(404, ['error' => 'No Google Maps place was found.']);
        storePlaceId($root, $cacheKey, $placeId);
    }

    $place = googleJson(
        'https://places.googleapis.com/v1/places/' . rawurlencode($placeId),
        $key,
        null,
        ['X-Goog-FieldMask: photos']
    );
    $photos = is_array($place['photos'] ?? null) ? $place['photos'] : [];
    if (!$photos) respond(404, ['error' => 'No property photo is available.']);
    usort($photos, static fn(array $a, array $b): int => (($b['widthPx'] ?? 0) * ($b['heightPx'] ?? 0)) <=> (($a['widthPx'] ?? 0) * ($a['heightPx'] ?? 0)));
    $photo = $photos[0];
    $name = trim((string)($photo['name'] ?? ''));
    if ($name === '') respond(404, ['error' => 'No property photo is available.']);
    $media = googleJson(
        'https://places.googleapis.com/v1/' . $name . '/media?maxWidthPx=1000&maxHeightPx=700&skipHttpRedirect=true',
        $key
    );
    $photoUri = trim((string)($media['photoUri'] ?? ''));
    if ($photoUri === '' || !preg_match('#^https://#i', $photoUri)) respond(404, ['error' => 'No property photo is available.']);
    $authors = [];
    foreach (($photo['authorAttributions'] ?? []) as $author) {
        if (!is_array($author) || empty($author['displayName'])) continue;
        $authors[] = ['name' => (string)$author['displayName'], 'url' => (string)($author['uri'] ?? '')];
    }
    respond(200, [
        'imageUrl' => $photoUri,
        'sourceUrl' => (string)($photo['googleMapsUri'] ?? ('https://www.google.com/maps/place/?q=place_id:' . rawurlencode($placeId))),
        'authors' => $authors,
        'alt' => $property['name'] . ' property photo',
    ]);
} catch (Throwable $error) {
    error_log('[accommodation-photo] ' . $error->getMessage());
    respond(502, ['error' => 'Property photo is temporarily unavailable.']);
}
