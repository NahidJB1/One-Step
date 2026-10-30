<?php
require __DIR__ . '/../includes/university_application.php';
function check(bool $passed, string $label): void { if (!$passed) throw new RuntimeException($label); }
$valid = ['university'=>'inti', 'course'=>'Computer Science', 'fullName'=>'Test Student', 'passportNumber'=>'', 'phone'=>'+880 1712 345678', 'email'=>'student@example.com', 'nationality'=>'Bangladeshi'];
$options = ['inti'=>'INTI International University'];
[$values,$errors] = validateUniversityApplication($valid,$options);
check(!$errors, 'Valid application with optional passport accepted');
foreach (['email'=>'invalid-email','university'=>'unknown','fullName'=>'','phone'=>'abc123','nationality'=>'','passportNumber'=>'<script>'] as $field=>$value) {
    $input = $valid; $input[$field] = $value;
    [, $errors] = validateUniversityApplication($input,$options);
    check(isset($errors[$field]), 'Reject invalid '.$field);
}
foreach (['email','fullName','university'] as $field) {
    $input = $valid; $input[$field] = ['unexpected'];
    [, $errors] = validateUniversityApplication($input,$options);
    check(isset($errors[$field]), 'Reject array '.$field);
}
echo "University application validation checks passed.\n";
