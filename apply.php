<?php
declare(strict_types=1);
session_set_cookie_params(['httponly'=>true, 'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'samesite'=>'Lax']);
session_start();
header('X-Robots-Tag: noindex, follow');
header('Cache-Control: no-store');
require_once __DIR__ . '/includes/university_application.php';
$options = json_decode(file_get_contents(__DIR__ . '/data/university_application_options.json'), true, 512, JSON_THROW_ON_ERROR);
$universities = array_column($options, 'name', 'id');
$_SESSION['university_apply_token'] ??= bin2hex(random_bytes(32));
$values = ['university'=>is_string($_GET['university'] ?? null) ? $_GET['university'] : '', 'course'=>is_string($_GET['course'] ?? null) ? substr($_GET['course'],0,500) : '', 'fullName'=>'', 'passportNumber'=>'', 'phone'=>'', 'email'=>'', 'nationality'=>''];
$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    [$values, $errors] = validateUniversityApplication($_POST, $universities);
    if (!is_string($_POST['token'] ?? null) || !hash_equals($_SESSION['university_apply_token'], $_POST['token'])) $errors['form'] = 'Your form expired. Please submit again.';
    if (!empty($_POST['website'])) $errors['form'] = 'Unable to submit this application.';
    if (time() - ($_SESSION['university_apply_last'] ?? 0) < 60) $errors['form'] = 'Please wait a minute before submitting another application.';
    if (!$errors) {
        try {
            require __DIR__ . '/db_config.php';
            mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
            $conn = new mysqli($host, $user, $pass, $dbname);
            $conn->set_charset('utf8mb4');
            $conn->query('CREATE TABLE IF NOT EXISTS university_application_details (application_id INT NOT NULL PRIMARY KEY, university_slug VARCHAR(80) NOT NULL, course_name VARCHAR(500) NOT NULL DEFAULT \'\', nationality VARCHAR(100) NOT NULL, passport_number VARCHAR(40) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
            $conn->begin_transaction();
            $interest = substr($universities[$values['university']] . ($values['course'] !== '' ? ' - ' . $values['course'] : ''), 0, 250);
            $education = 'Not requested';
            $passportStatus = $values['passportNumber'] !== '' ? 'Yes' : 'No';
            $stmt = $conn->prepare('INSERT INTO student_applications (full_name, phone, email, education_qualification, study_interest, has_passport) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->bind_param('ssssss', $values['fullName'], $values['phone'], $values['email'], $education, $interest, $passportStatus);
            $stmt->execute();
            $applicationId = $conn->insert_id;
            $stmt = $conn->prepare('INSERT INTO university_application_details (application_id, university_slug, course_name, nationality, passport_number) VALUES (?, ?, ?, ?, ?)');
            $passport = $values['passportNumber'] !== '' ? $values['passportNumber'] : null;
            $stmt->bind_param('issss', $applicationId, $values['university'], $values['course'], $values['nationality'], $passport);
            $stmt->execute();
            $conn->commit();
            $_SESSION['university_apply_last'] = time();
            $_SESSION['university_apply_success'] = true;
            $_SESSION['university_apply_token'] = bin2hex(random_bytes(32));
            header('Location: /apply?submitted=1', true, 303);
            exit;
        } catch (Throwable $exception) {
            if (isset($conn)) { try { $conn->rollback(); } catch (Throwable $ignored) {} }
            error_log('University application storage failed: ' . get_class($exception));
            $errors['form'] = 'We could not save your application. Please try again or contact us on WhatsApp.';
            http_response_code(503);
        }
    } else http_response_code(422);
}
$success = !empty($_SESSION['university_apply_success']);
unset($_SESSION['university_apply_success']);
function e(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
?>
<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, follow"><title>Apply to a University | One-Step</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/css/index.css"><link rel="stylesheet" href="/assets/css/mobile.css"><link rel="stylesheet" href="/assets/css/apply.css">
</head><body><div id="global-nav-placeholder"></div><main class="apply-shell"><div class="apply-heading"><p>Study in Malaysia</p><h1>Start your application</h1><p>Share your details and our team will help you with the next steps.</p></div>
<?php if ($success): ?><section class="apply-success" role="status"><h2>Application submitted</h2><p>Thank you. Our team will contact you using the details you provided.</p><a href="/explore-universities">Explore universities</a></section><?php else: ?>
<form method="post" action="/apply" class="apply-form">
<?php if ($errors): ?><div class="apply-errors" role="alert"><strong>Please check your application</strong><ul><?php foreach ($errors as $error): ?><li><?= e($error) ?></li><?php endforeach ?></ul></div><?php endif ?>
<input type="hidden" name="token" value="<?= e($_SESSION['university_apply_token']) ?>"><div class="apply-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
<label for="university">University <span>*</span></label><select id="university" name="university" required><option value="">Select a university</option><?php foreach ($universities as $id=>$name): ?><option value="<?= e($id) ?>" <?= $values['university']===$id?'selected':'' ?>><?= e($name) ?></option><?php endforeach ?></select>
<?php if ($values['course'] !== ''): ?><label for="course">Selected course</label><input id="course" name="course" maxlength="500" value="<?= e($values['course']) ?>"><p class="apply-hint">You can update the course if needed.</p><?php endif ?>
<label for="fullName">Full Name <span>*</span></label><input id="fullName" name="fullName" autocomplete="name" required maxlength="150" value="<?= e($values['fullName']) ?>">
<label for="passportNumber">Passport Number <small>(optional)</small></label><input id="passportNumber" name="passportNumber" maxlength="40" autocomplete="off" value="<?= e($values['passportNumber']) ?>">
<label for="phone">Contact Number <span>*</span></label><input id="phone" name="phone" type="tel" autocomplete="tel" required maxlength="30" placeholder="Include your country code, e.g. +880" value="<?= e($values['phone']) ?>">
<label for="email">Email Address <span>*</span></label><input id="email" name="email" type="email" autocomplete="email" required maxlength="254" value="<?= e($values['email']) ?>">
<label for="nationality">Nationality <span>*</span></label><input id="nationality" name="nationality" required maxlength="100" placeholder="e.g. Bangladeshi" value="<?= e($values['nationality']) ?>">
<p class="apply-hint">By submitting, you agree that One-Step may contact you about your university application.</p><button type="submit">Submit application</button><p class="apply-help">Need help? <a href="https://wa.me/601119359497" target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a></p>
</form><?php endif ?></main><div id="global-footer-placeholder"></div><script src="/assets/js/navbar.js"></script><script src="/assets/js/footer.js"></script></body></html>
