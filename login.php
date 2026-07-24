<?php
session_start();

require_once 'db_config.php';

$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input_user = $_POST['username'] ?? '';
    $input_pass = $_POST['password'] ?? '';

    // Connect to Database
    $conn = getDbConnection();
    
    // --- 2. SECURE CHECK ---
    // Look for the user in the database
    $stmt = $conn->prepare("SELECT id, password_hash FROM admins WHERE username = ?");
    $stmt->bind_param("s", $input_user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Verify the password matches the hash
        if (password_verify($input_pass, $row['password_hash'])) {
            // SUCCESS: Login allowed
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id'] = $row['id'];
            header("Location: admin.php");
            exit;
        } else {
            $error = "Invalid password!";
        }
    } else {
        $error = "User not found!";
    }
    
    $stmt->close();
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Admin Login | One Step</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        :root {
            --primary: #0066CC;
            --primary-dark: #004C99;
            --secondary: #00C2FF;
            --dark: #0A192F;
            --light: #F8FAFF;
            --gray: #64748B;
            --gray-light: #E2E8F0;
            --border-radius: 16px;
            --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.08);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        body { 
            font-family: 'Outfit', sans-serif; 
            background: linear-gradient(135deg, var(--light) 0%, #e0e8f5 100%); 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0; 
            color: var(--dark);
        }

        h2, h3 { font-family: 'Poppins', sans-serif; }

        .login-card { 
            background: white; 
            padding: 50px 40px; 
            border-radius: var(--border-radius); 
            box-shadow: var(--shadow-lg); 
            width: 100%; 
            max-width: 400px; 
            text-align: center; 
            border: 1px solid rgba(255,255,255,0.5);
        }

        .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 30px;
        }

        .logo-img {
            height: 45px;
            width: auto;
        }

        .logo-text {
            display: flex;
            flex-direction: column;
            line-height: 1.1;
            text-align: left;
        }

        .logo-text span:first-child {
            font-size: 1.3rem;
            color: var(--primary);
            font-weight: 700;
        }

        .logo-text span:last-child {
            font-size: 0.85rem;
            color: var(--gray);
            font-weight: 500;
        }

        h2 { 
            color: var(--dark); 
            margin-bottom: 25px; 
            font-size: 1.5rem;
            font-weight: 600;
        }

        .form-group { 
            margin-bottom: 20px; 
            text-align: left; 
            position: relative;
        }

        label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: 500; 
            color: var(--gray); 
            font-size: 0.9rem;
        }

        input { 
            width: 100%; 
            padding: 14px 16px; 
            border: 2px solid var(--gray-light); 
            border-radius: 10px; 
            box-sizing: border-box; 
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            transition: var(--transition);
            background: #fcfcfc;
            color: var(--dark);
        }

        input:focus {
            border-color: var(--primary);
            background: white;
            outline: none;
            box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.1);
        }

        .btn-login { 
            background: linear-gradient(135deg, var(--primary), var(--secondary)); 
            color: white; 
            width: 100%; 
            padding: 14px; 
            border: none; 
            border-radius: 10px; 
            font-weight: 600; 
            font-size: 1.05rem;
            cursor: pointer; 
            transition: var(--transition);
            margin-top: 10px;
        }

        .btn-login:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 15px rgba(0, 102, 204, 0.2);
        }

        .error-msg { 
            background: #fef2f2; 
            color: #ef4444; 
            padding: 12px; 
            border-radius: 10px; 
            margin-bottom: 25px; 
            font-size: 0.9rem;
            border: 1px solid #fee2e2;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
    </style>
</head>
<body>

    <div class="login-card">
        <div class="logo-container">
            <img src="favicon.svg" alt="One Step Logo" class="logo-img">
            <div class="logo-text">
                <span>One Step</span>
                <span>Study in Malaysia</span>
            </div>
        </div>

        <h2>Admin Access</h2>
        
        <?php if($error): ?>
            <div class="error-msg"><i class="fas fa-exclamation-circle"></i> <?php echo $error; ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" required placeholder="Enter your username">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required placeholder="Enter your password">
            </div>
            <button type="submit" class="btn-login"><i class="fas fa-sign-in-alt"></i> Login</button>
        </form>
    </div>

</body>
</html>