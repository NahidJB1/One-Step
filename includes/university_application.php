<?php
declare(strict_types=1);
function validateUniversityApplication(array $input, array $universities): array {
    $values = [];
    $errors = [];
    foreach (['university'=>80, 'course'=>500, 'fullName'=>150, 'passportNumber'=>40, 'phone'=>30, 'email'=>254, 'nationality'=>100] as $field=>$limit) {
        $value = $input[$field] ?? '';
        if (!is_string($value) || strlen($value) > $limit || preg_match('/[\x00-\x1F\x7F]/', $value)) {
            $labels = ['fullName'=>'full name', 'passportNumber'=>'passport number', 'phone'=>'contact number', 'email'=>'email address'];
            $errors[$field] = 'Please enter a valid ' . ($labels[$field] ?? $field) . '.';
            $value = '';
        }
        $values[$field] = trim($value);
    }
    if (!isset($universities[$values['university']])) $errors['university'] = 'Please select a university from the list.';
    if ($values['fullName'] === '' || strlen($values['fullName']) < 2) $errors['fullName'] = 'Please enter your full name.';
    if ($values['passportNumber'] !== '' && !preg_match('/^[A-Za-z0-9 -]{3,40}$/', $values['passportNumber'])) $errors['passportNumber'] = 'Please check your passport number or leave it blank.';
    $digits = preg_replace('/\D/', '', $values['phone']);
    if (!preg_match('/^\+?[0-9 ()\-.]+$/', $values['phone']) || strlen($digits) < 7 || strlen($digits) > 15) $errors['phone'] = 'Please enter a valid contact number including your country code.';
    if (!filter_var($values['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please enter a valid email address.';
    if (strlen($values['nationality']) < 2) $errors['nationality'] = 'Please enter your nationality.';
    return [$values, $errors];
}
