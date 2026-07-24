<?php
session_start();

// --- SECURITY CHECK ---
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.php");
    exit;
}

require_once 'db_config.php';
$conn = getDbConnection();

// --- CSRF TOKEN GENERATION ---
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// --- HANDLE POST ACTIONS ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    // Validate CSRF
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        die("CSRF validation failed.");
    }

    if ($_POST['action'] === 'add_cert') {
        $cert_number = trim($_POST['cert_number']);
        $student_name = trim($_POST['student_name'] ?? '');
        $institution = trim($_POST['institution'] ?? '');
        $category = trim($_POST['category'] ?? 'Tier A');
        $issue_date = trim($_POST['issue_date'] ?? '');
        $position = trim($_POST['position'] ?? 'Participant');
        
        $stmt = $conn->prepare("INSERT INTO certificates (cert_number, student_name, institution, category, issue_date, position) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $cert_number, $student_name, $institution, $category, $issue_date, $position);
        $stmt->execute();
        $stmt->close();
        
        header("Location: admin.php?view=certificates");
        exit;
    }
    if ($_POST['action'] === 'edit_cert') {
        $id = (int)$_POST['cert_id'];
        $name = $_POST['student_name'];
        $inst = $_POST['institution'];
        $cat = $_POST['category'];
        $date = $_POST['issue_date'];
        $pos = $_POST['position'];
        
        $stmt = $conn->prepare("UPDATE certificates SET student_name=?, institution=?, category=?, issue_date=?, position=? WHERE id=?");
        $stmt->bind_param("sssssi", $name, $inst, $cat, $date, $pos, $id);
        $stmt->execute();
        $stmt->close();
        
        header("Location: admin.php?view=certificates");
        exit;
    }
    if ($_POST['action'] === 'delete_cert') {
        $id = (int)$_POST['cert_id'];
        
        $stmt = $conn->prepare("DELETE FROM certificates WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
        
        header("Location: admin.php?view=certificates");
        exit;
    }
    if ($_POST['action'] === 'toggle_payment') {
        $id = (int)$_POST['student_id'];
        $new_status = $_POST['new_status'];
        
        $stmt = $conn->prepare("UPDATE students SET payment_status=? WHERE id=?");
        $stmt->bind_param("si", $new_status, $id);
        $stmt->execute();
        $stmt->close();
        
        header("Location: admin.php?" . $_SERVER['QUERY_STRING']);
        exit;
    }
    
    // --- FEES & PDFs MANAGEMENT ---
    if ($_POST['action'] === 'save_fees') {
        $json = $_POST['fees_json'];
        
        // Ensure data directory exists
        if (!is_dir('data')) {
            mkdir('data', 0777, true);
        }
        
        file_put_contents('data/fees_data.json', $json);
        header("Location: admin.php?view=fees&uni=" . urlencode($_POST['uni_id']));
        exit;
    }
}

// --- 3. DETERMINE WHICH VIEW & FILTERS TO SHOW ---
$current_view = isset($_GET['view']) ? $_GET['view'] : 'scholarship';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
if ($page < 1) $page = 1;
$limit = 50;
$offset = ($page - 1) * $limit;
$total_records = 0;

if ($current_view == 'applications') {
    $count_res = $conn->query("SELECT COUNT(*) as cnt FROM student_applications");
    $total_records = $count_res->fetch_assoc()['cnt'];
    $sql = "SELECT * FROM student_applications ORDER BY id DESC LIMIT $limit OFFSET $offset";
    $page_title = "Student Applications";
    $page_desc = "Review submitted study applications";
} elseif ($current_view == 'ms_applications') {
    // If the table doesn't exist yet, this could throw an error on fresh install before anyone submits, 
    // but the table is created on first submission in submit_malaysia_scholarship.php. 
    // To be safe, suppress warning and default to 0 if table doesn't exist.
    $count_res = @$conn->query("SELECT COUNT(*) as cnt FROM malaysia_scholarships");
    $total_records = $count_res ? $count_res->fetch_assoc()['cnt'] : 0;
    $sql = "SELECT * FROM malaysia_scholarships ORDER BY id DESC LIMIT $limit OFFSET $offset";
    $page_title = "Malaysia Scholarships";
    $page_desc = "Review submitted Malaysia scholarship applications";
} elseif ($current_view == 'certificates') {
    $count_res = $conn->query("SELECT COUNT(*) as cnt FROM certificates");
    $total_records = $count_res->fetch_assoc()['cnt'];
    $sql = "SELECT * FROM certificates ORDER BY id DESC LIMIT $limit OFFSET $offset";
    $page_title = "Manage Certificates";
    $page_desc = "Add numbers, edit details, and manage verify records";
} elseif ($current_view == 'fees') {
    $page_title = "Fees & PDFs Management";
    $page_desc = "Update university fee charts and manage PDF files";
    $total_records = 0;
    $sql = "SELECT 1"; // Dummy query so $result doesn't fail
    
    // Load existing fees data
    $fees_data = [];
    if (file_exists('data/fees_data.json')) {
        $fees_data = json_decode(file_get_contents('data/fees_data.json'), true);
    }
} else {
    $page_title = "Scholarship Exams";
    $page_desc = "Manage exam registrations & payments";
    
    // Build Filter Query
    $where_clauses = [];
    if (!empty($_GET['school'])) $where_clauses[] = "school_name = '" . $conn->real_escape_string($_GET['school']) . "'";
    if (!empty($_GET['class'])) $where_clauses[] = "class_name = '" . $conn->real_escape_string($_GET['class']) . "'";
    if (!empty($_GET['method'])) $where_clauses[] = "payment_method = '" . $conn->real_escape_string($_GET['method']) . "'";
    
    $where_sql = count($where_clauses) > 0 ? " WHERE " . implode(" AND ", $where_clauses) : "";
    
    $count_res = $conn->query("SELECT COUNT(*) as cnt FROM students $where_sql");
    $total_records = $count_res->fetch_assoc()['cnt'];
    
    $sql_export = "SELECT * FROM students $where_sql ORDER BY id DESC";
    $sql = $sql_export . " LIMIT $limit OFFSET $offset";

    // Handle Word Export
    if (isset($_GET['export']) && $_GET['export'] == 'word') {
        header("Content-Type: application/vnd.ms-word");
        header("Content-Disposition: attachment; filename=Scholarship_Data.doc");
        echo "<html><body><h2>Scholarship Registrations</h2><table border='1' cellpadding='5' style='border-collapse:collapse; width:100%;'>";
        echo "<tr><th>ID</th><th>Student Name</th><th>Class</th><th>Institution</th><th>Method</th><th>Status/TRX</th></tr>";
        $export_res = $conn->query($sql_export);
        while($row = $export_res->fetch_assoc()) {
            $status = ($row['payment_method'] == 'cash') ? ($row['payment_status'] ?: 'Pending') : $row['trx_id'];
            echo "<tr><td>{$row['id']}</td><td>{$row['full_name']}</td><td>{$row['class_name']}</td><td>{$row['school_name']}</td><td>{$row['payment_method']}</td><td>{$status}</td></tr>";
        }
        echo "</table></body></html>";
        exit;
    }
}
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Admin Dashboard | One Step</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        :root {
            --primary: #0066CC;
            --primary-dark: #004C99;
            --secondary: #0A192F;
            --active-bg: #e0f2fe;
            --active-text: #0066CC;
            --border: #e2e8f0;
            --bg: #F8FAFC;
        }
        
        * { box-sizing: border-box; }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg);
            margin: 0;
            padding: 0;
            color: var(--secondary);
            height: 100vh;
            display: flex;
            overflow: hidden; /* Prevent body scroll, we scroll content */
        }

        /* --- LAYOUT: Sidebar + Main Content --- */
        
        /* 1. Sidebar */
        .sidebar {
            width: 260px;
            background: white;
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            padding: 20px;
            height: 100%;
            flex-shrink: 0;
            z-index: 10;
        }

        .brand {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .nav-menu {
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex-grow: 1;
        }

        .nav-item {
            text-decoration: none;
            padding: 12px 16px;
            border-radius: 10px;
            color: #64748b;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s ease;
        }

        .nav-item:hover {
            background-color: #f1f5f9;
            color: var(--secondary);
        }

        .nav-item.active {
            background-color: var(--active-bg);
            color: var(--active-text);
        }

        /* Toggle Switch for Dev Mode */
        .switch-container {
            position: relative;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            gap: 10px;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #cbd5e1;
            transition: .4s;
            border-radius: 34px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: #10b981;
        }
        input:checked + .slider:before {
            transform: translateX(24px);
        }
        .switch-label {
            font-weight: 600;
            color: #64748b;
        }

        .logout-btn {
            margin-top: auto;
            color: #ef4444;
            border: 1px solid #fee2e2;
            background: #fef2f2;
        }
        .logout-btn:hover { background: #fee2e2; }

        /* 2. Main Content Area */
        .main-content {
            flex-grow: 1;
            padding: 30px;
            overflow-y: auto; /* Scroll ONLY the content area */
            position: relative;
        }

        /* Header within Main Content */
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 30px;
        }

        .page-title h2 { margin: 0; font-size: 1.8rem; }
        .page-title p { margin: 5px 0 0; color: #64748b; }

        .stat-badge {
            background: white;
            padding: 10px 20px;
            border-radius: 50px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            font-weight: 700;
            color: var(--primary);
            border: 1px solid var(--border);
        }

        /* --- TABLE STYLES --- */
        .table-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border);
            overflow: hidden;
        }

        .table-responsive {
            overflow-x: auto;
            width: 100%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 900px;
        }

        thead { background: #F8FAFC; border-bottom: 2px solid var(--border); }
        
        th {
            text-align: left;
            padding: 18px 20px;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            font-weight: 700;
        }

        td {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
            font-size: 0.95rem;
        }
        
        tr:last-child td { border-bottom: none; }
        tr:hover { background-color: #F8FAFC; }

        /* Badges & Buttons */
        .badge {
            display: inline-block; padding: 6px 12px;
            border-radius: 50px; font-size: 0.75rem; font-weight: 600;
            text-transform: capitalize;
        }
        .badge.digital { background: #DBEAFE; color: #1E40AF; }
        .badge.cash { background: #DCFCE7; color: #166534; }
        .badge.Yes { background: #DCFCE7; color: #166534; }
        .badge.No { background: #fee2e2; color: #ef4444; }

        .btn-view {
            text-decoration: none; background: white;
            border: 1px solid var(--primary); color: var(--primary);
            padding: 6px 14px; border-radius: 8px;
            font-size: 0.85rem; font-weight: 500;
            display: inline-flex; align-items: center; gap: 6px;
            cursor: pointer; transition: all 0.2s;
        }
        .btn-view:hover {
            background: var(--primary); color: white;
        }

        /* --- MODAL STYLES (Unchanged logic) --- */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85); z-index: 2000;
            display: flex; justify-content: center; align-items: center;
            opacity: 0; visibility: hidden; transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }
        .modal-overlay.active { opacity: 1; visibility: visible; }
        
        .modal-container { position: relative; max-width: 800px; width: 95%; }
        
        .modal-content {
            background: white; padding: 10px; border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            max-height: 90vh; overflow-y: auto; display: flex; justify-content: center;
        }
        
        .modal-content img {
            width: 100%; height: auto; max-height: 85vh;
            object-fit: contain; border-radius: 8px; display: block;
        }
        
        .close-btn {
            position: absolute; top: -40px; right: 0;
            color: white; font-size: 2rem; cursor: pointer;
        }

        /* --- MOBILE RESPONSIVE --- */
        @media (max-width: 768px) {
            body { 
                flex-direction: column; 
                overflow: auto; 
                padding-bottom: 70px; /* Space for bottom nav */
            }
            
            /* Bottom Navigation */
            .sidebar {
                width: 100%; 
                height: 70px;
                padding: 0 10px;
                border-right: none; 
                border-top: 1px solid var(--border);
                flex-direction: row; 
                align-items: center; 
                position: fixed;
                bottom: 0;
                top: auto;
                left: 0;
                z-index: 1000;
                box-shadow: 0 -4px 15px rgba(0,0,0,0.05);
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                justify-content: space-between;
            }

            .brand { display: none; } /* Hide brand on mobile nav */

            .nav-menu {
                flex-direction: row; 
                gap: 5px;
                margin: 0;
                width: 100%;
                justify-content: space-between;
                align-items: center;
            }

            .nav-item { 
                flex-direction: column;
                padding: 8px 5px; 
                font-size: 0.7rem; 
                border-radius: 8px;
                gap: 4px;
                flex: 1;
                text-align: center;
                justify-content: center;
            }
            .nav-item i { font-size: 1.2rem; margin: 0; }
            .nav-item span { display: block; margin: 0; }

            .logout-btn { 
                margin-top: 0; 
            }

            .main-content { 
                padding: 20px 15px 40px 15px; 
                overflow: visible; 
            }
            
            /* Page Header Adjustments */
            .page-header { 
                flex-direction: column; 
                align-items: flex-start; 
                gap: 15px; 
            }

            .header-actions {
                width: 100%;
                justify-content: space-between;
            }

            /* --- Card View for Tables --- */
            table, thead, tbody, th, td, tr { 
                display: block; 
            }
            
            thead tr { 
                position: absolute;
                top: -9999px;
                left: -9999px;
            }
            
            tr { 
                border: 1px solid var(--border);
                border-radius: 12px;
                margin-bottom: 15px;
                background: white;
                box-shadow: 0 4px 10px rgba(0,0,0,0.03);
            }
            
            td { 
                border: none;
                border-bottom: 1px solid #f8fafc; 
                position: relative;
                padding: 12px 15px; 
                padding-left: 40%; 
                font-size: 0.9rem;
                text-align: left;
                min-height: 45px;
            }
            
            td:before { 
                position: absolute;
                top: 12px;
                left: 15px;
                width: 35%; 
                padding-right: 10px; 
                white-space: nowrap;
                font-weight: 600;
                color: #64748b;
                font-size: 0.8rem;
                text-transform: uppercase;
            }

            /* Scholarship Table Labels */
            .mobile-scholarship td:nth-of-type(1):before { content: "ID"; }
            .mobile-scholarship td:nth-of-type(2):before { content: "Student"; }
            .mobile-scholarship td:nth-of-type(3):before { content: "Roll & Class"; }
            .mobile-scholarship td:nth-of-type(4):before { content: "Institution"; }
            .mobile-scholarship td:nth-of-type(5):before { content: "Method"; }
            .mobile-scholarship td:nth-of-type(6):before { content: "Status/TRX"; }
            .mobile-scholarship td:nth-of-type(7):before { content: "Action"; }

            /* Applications Table Labels */
            .mobile-applications td:nth-of-type(1):before { content: "ID"; }
            .mobile-applications td:nth-of-type(2):before { content: "Name"; }
            .mobile-applications td:nth-of-type(3):before { content: "Contact"; }
            .mobile-applications td:nth-of-type(4):before { content: "Qualification"; }
            .mobile-applications td:nth-of-type(5):before { content: "Interest"; }
            .mobile-applications td:nth-of-type(6):before { content: "Passport"; }

            /* Certificates Table Labels */
            .mobile-certificates td:nth-of-type(1):before { content: "Cert #"; }
            .mobile-certificates td:nth-of-type(2):before { content: "Student"; }
            .mobile-certificates td:nth-of-type(3):before { content: "Institution"; }
            .mobile-certificates td:nth-of-type(4):before { content: "Category"; }
            .mobile-certificates td:nth-of-type(5):before { content: "Issue Date"; }
            .mobile-certificates td:nth-of-type(6):before { content: "Action"; }

            td:last-child { border-bottom: 0; }

            /* Modal Adjustments */
            .modal-container { width: 100%; padding: 10px; }
            .form-modal { padding: 20px; }
            .form-actions { flex-direction: column; gap: 10px; }
            .form-actions button { width: 100%; }
            .dropdown-content { right: 0; transform: translateX(-10px); }
        }


        /* --- NEW CSS FOR ADMIN CERTIFICATES --- */
        .header-actions { display: flex; align-items: center; justify-content: space-between; }
        .btn-primary { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { background: #0056b3; }

        /* 3-Dot Dropdown */
        .dropdown { position: relative; display: inline-block; }
        .dropbtn { background: none; border: none; font-size: 1.2rem; color: #64748b; cursor: pointer; padding: 5px 10px; }
        .dropdown-content { display: none; position: absolute; right: 0; background-color: white; min-width: 120px; box-shadow: 0px 8px 16px rgba(0,0,0,0.1); border-radius: 8px; z-index: 1; border: 1px solid var(--border); }
        .dropdown-content button { color: var(--secondary); padding: 12px 16px; text-decoration: none; display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 0.9rem; }
        .dropdown-content button:hover { background-color: #f1f5f9; }
        .dropdown-content button.text-danger { color: #ef4444; }
        .dropdown:hover .dropdown-content { display: block; }

        /* Form Modal */
        .form-modal { background: white; padding: 30px; border-radius: 12px; width: 100%; max-width: 450px; position: relative; }
        .form-modal h3 { margin-top: 0; margin-bottom: 20px; color: var(--primary); }
        .form-group { margin-bottom: 15px; text-align: left; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; color: #64748b; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; font-family: inherit; }
        .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px; }
        .btn-secondary { background: #e2e8f0; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }

/* --- FILTERS & ACTIONS --- */
        .filter-bar {
            background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px;
            display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
            border: 1px solid var(--border);
        }
        .filter-bar select {
            padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); font-family: inherit; outline: none;
        }
        .btn-outline {
            background: white; border: 1px solid var(--border); color: var(--secondary); padding: 8px 15px;
            border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; text-decoration: none; font-size: 0.9rem;
        }
        .btn-outline:hover { background: #f1f5f9; }
        
        .cash-checkbox { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.85rem; font-weight: 600;}
        .cash-checkbox input { cursor: pointer; width: 16px; height: 16px; accent-color: #166534; margin:0;}

        /* Pagination */
        .pagination { display: flex; justify-content: center; padding: 20px; gap: 5px; }
        .pagination a { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; text-decoration: none; color: var(--secondary); }
        .pagination a.active { background: var(--primary); color: white; border-color: var(--primary); }
        .pagination a:hover:not(.active) { background: #f1f5f9; }

        /* --- PRINT TO PDF STYLES --- */
        @media print {
            body { background: white; overflow: visible; height: auto; }
            .sidebar, .page-header, .filter-bar, .action-col, .btn-view, .pagination { display: none !important; }
            .main-content { padding: 0; overflow: visible; }
            .table-card { box-shadow: none; border: none; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            th, td { border: 1px solid #000; padding: 8px; font-size: 12px; }
            th.action-col, td.action-col { display: none; }
        }

                
    </style>
</head>
<body>

    <aside class="sidebar">
        <div class="brand">
            <img src="favicon.svg" alt="One Step Logo" style="height: 32px; width: auto;"> 
            <div style="display: flex; flex-direction: column; line-height: 1.1;">
                <span style="font-size: 1.3rem; color: var(--primary); font-weight: 700;">One Step</span>
                <span style="font-size: 0.8rem; color: #64748b; font-weight: 500;">Admin Portal</span>
            </div>
        </div>
        
        <nav class="nav-menu">
            <a href="?view=scholarship" class="nav-item <?php echo ($current_view == 'scholarship') ? 'active' : ''; ?>">
                <i class="fas fa-graduation-cap"></i>
                <span>Scholarship</span>
            </a>
            
            <a href="?view=applications" class="nav-item <?php echo ($current_view == 'applications') ? 'active' : ''; ?>">
                <i class="fas fa-file-contract"></i>
                <span>Applications</span>
            </a>

            <a href="?view=ms_applications" class="nav-item <?php echo ($current_view == 'ms_applications') ? 'active' : ''; ?>">
                <i class="fas fa-award"></i>
                <span>MS Scholarships</span>
            </a>

            <a href="?view=certificates" class="nav-item <?php echo ($current_view == 'certificates') ? 'active' : ''; ?>">
                <i class="fas fa-certificate"></i>
                <span>Certificates</span>
            </a>
            
            <a href="?view=fees" class="nav-item <?php echo ($current_view == 'fees') ? 'active' : ''; ?>">
                <i class="fas fa-money-check-alt"></i>
                <span>Fees & PDFs</span>
            </a>

            <a href="logout.php" class="nav-item logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </nav>
    </aside>

    <main class="main-content">
        
        <div class="page-header">
            <div class="page-title">
                <h2><?php echo $page_title; ?></h2>
                <p><?php echo $page_desc; ?></p>
            </div>
            <div class="header-actions" style="gap: 15px; display: flex; align-items: center;">
                <div class="stat-badge">
                    <i class="fas fa-database"></i> <?php echo $total_records; ?> Total Records
                </div>
                <?php if ($current_view == 'certificates'): ?>
                    <button onclick="openAddCertModal()" class="btn-primary"><i class="fas fa-plus"></i> Add Number</button>
                <?php endif; ?>
            </div>
        </div>

        <div class="table-card">
            <div class="table-responsive">
                
                <?php if ($current_view == 'scholarship'): ?>
                
                <form method="GET" class="filter-bar">
                    <input type="hidden" name="view" value="scholarship">
                    
                    <select name="school">
                        <option value="">All Institutions</option>
                        <?php 
                        $schools = $conn->query("SELECT DISTINCT school_name FROM students WHERE school_name != ''");
                        while($s = $schools->fetch_assoc()): 
                            $sel = (isset($_GET['school']) && $_GET['school'] == $s['school_name']) ? 'selected' : '';
                        ?>
                            <option value="<?php echo htmlspecialchars($s['school_name']); ?>" <?php echo $sel; ?>><?php echo htmlspecialchars($s['school_name']); ?></option>
                        <?php endwhile; ?>
                    </select>

                    <select name="class">
                        <option value="">All Classes</option>
                        <?php 
                        $classes = $conn->query("SELECT DISTINCT class_name FROM students WHERE class_name != ''");
                        while($c = $classes->fetch_assoc()): 
                            $sel = (isset($_GET['class']) && $_GET['class'] == $c['class_name']) ? 'selected' : '';
                        ?>
                            <option value="<?php echo htmlspecialchars($c['class_name']); ?>" <?php echo $sel; ?>><?php echo htmlspecialchars($c['class_name']); ?></option>
                        <?php endwhile; ?>
                    </select>

                    <select name="method">
                        <option value="">All Methods</option>
                        <option value="digital" <?php echo (isset($_GET['method']) && $_GET['method']=='digital')?'selected':''; ?>>Digital</option>
                        <option value="cash" <?php echo (isset($_GET['method']) && $_GET['method']=='cash')?'selected':''; ?>>Cash</option>
                    </select>

                    <button type="submit" class="btn-primary" style="padding: 8px 15px;">Filter</button>
                    <a href="?view=scholarship" class="btn-outline">Clear</a>

                    <div style="flex-grow: 1;"></div> <button type="submit" name="export" value="word" class="btn-outline"><i class="fas fa-file-word" style="color: #2563eb;"></i> Word</button>
                    <button type="button" onclick="window.print()" class="btn-outline"><i class="fas fa-file-pdf" style="color: #dc2626;"></i> PDF</button>
                </form>

                <table class="mobile-scholarship">
                    <thead>
                        <tr>
                            <th width="5%">ID</th>
                            <th width="20%">Student Name</th>
                            <th width="15%">Roll & Class</th>
                            <th width="20%">Institution</th>
                            <th width="10%">Method</th>
                            <th width="15%">TRX ID</th>
                            <th width="15%" class="action-col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($result->num_rows > 0): ?>
                            <?php while($row = $result->fetch_assoc()): ?>
                                <tr>
                                    <td>#<?php echo $row['id']; ?></td>
                                    <td>
                                        <strong><?php echo htmlspecialchars($row['full_name']); ?></strong>
                                        <div style="font-size: 0.8rem; color: #94a3b8;">
                                            <?php echo date('M d, Y', strtotime($row['submission_date'])); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 600;">Roll: <?php echo htmlspecialchars($row['roll_number']); ?></div>
                                        <div style="font-size: 0.85rem; color: #64748b;"><?php echo htmlspecialchars($row['class_name']); ?></div>
                                    </td>
                                    <td><?php echo htmlspecialchars($row['school_name']); ?></td>
                                    <td>
                                        <span class="badge <?php echo $row['payment_method']; ?>">
                                            <?php echo $row['payment_method']; ?>
                                        </span>
                                    </td>
                                    <td style="font-family: monospace;">
                                        <?php 
                                            // Handle Cash Paid status display vs TRX ID
                                            if ($row['payment_method'] === 'cash') {
                                                $is_paid = (isset($row['payment_status']) && $row['payment_status'] == 'Paid');
                                                echo $is_paid ? '<span style="color:#166534; font-weight:bold;"><i class="fas fa-check-double"></i> Paid</span>' : '<span style="color:#ca8a04;">Pending</span>';
                                            } else {
                                                echo htmlspecialchars($row['trx_id']); 
                                            }
                                        ?>
                                    </td>
                                    <td class="action-col">
                                        <?php if ($row['payment_method'] === 'digital' && $row['receipt_file'] !== 'No-Receipt'): ?>
                                            <button onclick="showReceipt('uploads/<?php echo $row['receipt_file']; ?>')" class="btn-view">
                                                <i class="fas fa-eye"></i> Receipt
                                            </button>
                                        <?php elseif ($row['payment_method'] === 'cash'): ?>
                                            <?php 
                                                $is_paid = (isset($row['payment_status']) && $row['payment_status'] == 'Paid');
                                                // Keep query string to retain filters after refresh
                                                $q_string = $_SERVER['QUERY_STRING']; 
                                            ?>
                                            <form method="POST" action="?<?php echo $q_string; ?>" style="margin:0;">
                                                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                                <input type="hidden" name="action" value="toggle_payment">
                                                <input type="hidden" name="student_id" value="<?php echo $row['id']; ?>">
                                                <input type="hidden" name="new_status" value="<?php echo $is_paid ? 'Pending' : 'Paid'; ?>">
                                                <label class="cash-checkbox" style="color: <?php echo $is_paid ? '#166534' : '#64748b'; ?>;">
                                                    <input type="checkbox" onchange="this.form.submit()" <?php echo $is_paid ? 'checked' : ''; ?>>
                                                    <?php echo $is_paid ? 'Marked Paid' : 'Mark as Paid'; ?>
                                                </label>
                                            </form>
                                        <?php else: ?>
                                            <span style="color: #94a3b8;">—</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr><td colspan="7" style="text-align:center; padding: 40px;">No registrations found.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>

                <?php elseif ($current_view == 'applications'): ?>
                <table class="mobile-applications">
                    <thead>
                        <tr>
                            <th width="5%">ID</th>
                            <th width="20%">Name</th>
                            <th width="20%">Contact</th>
                            <th width="20%">Qualification</th>
                            <th width="20%">Interest</th>
                            <th width="15%">Passport</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($result->num_rows > 0): ?>
                            <?php while($row = $result->fetch_assoc()): ?>
                                <tr>
                                    <td>#<?php echo $row['id']; ?></td>
                                    <td>
                                        <strong><?php echo htmlspecialchars($row['full_name']); ?></strong>
                                        <div style="font-size: 0.8rem; color: #94a3b8;">
                                            <?php echo date('M d, Y', strtotime($row['submission_date'])); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-size:0.9rem;"><i class="fas fa-phone-alt" style="font-size:0.8rem; width:15px;"></i> <?php echo htmlspecialchars($row['phone']); ?></div>
                                        <div style="font-size:0.85rem; color: #64748b; margin-top:3px;"><i class="fas fa-envelope" style="font-size:0.8rem; width:15px;"></i> <?php echo htmlspecialchars($row['email']); ?></div>
                                    </td>
                                    <td>
                                        <span style="font-weight: 500; color: var(--primary);">
                                            <?php echo htmlspecialchars($row['education_qualification']); ?>
                                        </span>
                                    </td>
                                    <td><?php echo htmlspecialchars($row['study_interest']); ?></td>
                                    <td>
                                        <span class="badge <?php echo $row['has_passport']; ?>">
                                            <?php echo $row['has_passport']; ?>
                                        </span>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr><td colspan="6" style="text-align:center; padding: 40px;">No applications received yet.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>

                <?php elseif ($current_view == 'ms_applications'): ?>
                <table class="mobile-applications">
                    <thead>
                        <tr>
                            <th width="5%">ID</th>
                            <th width="15%">Name</th>
                            <th width="15%">Passport</th>
                            <th width="20%">Results</th>
                            <th width="20%">University & Subject</th>
                            <th width="15%">Grant Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        // Only run query if table exists (handled by @ in count_res)
                        $ms_result = @$conn->query($sql);
                        if ($ms_result && $ms_result->num_rows > 0): 
                        ?>
                            <?php while($row = $ms_result->fetch_assoc()): ?>
                                <tr>
                                    <td>#<?php echo $row['id']; ?></td>
                                    <td>
                                        <strong><?php echo htmlspecialchars($row['full_name']); ?></strong>
                                        <div style="font-size: 0.8rem; color: #94a3b8;">
                                            <?php echo date('M d, Y', strtotime($row['submission_date'])); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-size:0.9rem;"><?php echo htmlspecialchars($row['passport_number']); ?></div>
                                    </td>
                                    <td>
                                        <div style="font-size:0.85rem; color: #1e293b;"><strong><?php echo htmlspecialchars($row['qualification']); ?></strong> (<?php echo htmlspecialchars($row['passing_year']); ?>)</div>
                                        <?php if (!empty($row['ssc_gpa']) && $row['ssc_gpa'] != '0'): ?><div style="font-size:0.8rem; color: #64748b;">SSC: <?php echo htmlspecialchars($row['ssc_gpa']); ?></div><?php endif; ?>
                                        <?php if (!empty($row['hsc_gpa']) && $row['hsc_gpa'] != '0'): ?><div style="font-size:0.8rem; color: #64748b;">HSC: <?php echo htmlspecialchars($row['hsc_gpa']); ?></div><?php endif; ?>
                                        <?php if (!empty($row['bachelor_cgpa']) && $row['bachelor_cgpa'] != '0'): ?><div style="font-size:0.8rem; color: #64748b;">Bachelor: <?php echo htmlspecialchars($row['bachelor_cgpa']); ?></div><?php endif; ?>
                                        <?php if (!empty($row['masters_cgpa']) && $row['masters_cgpa'] != '0'): ?><div style="font-size:0.8rem; color: #64748b;">Master: <?php echo htmlspecialchars($row['masters_cgpa']); ?></div><?php endif; ?>
                                    </td>
                                    <td>
                                        <div style="font-weight: 600; color: var(--primary);">
                                            <?php echo htmlspecialchars($row['university']); ?>
                                        </div>
                                        <div style="font-size: 0.85rem; color: #475569; margin-top:3px;"><?php echo htmlspecialchars($row['subject']); ?></div>
                                    </td>
                                    <td>
                                        <div style="font-weight: bold; color: #166534; font-size: 1.1rem;">
                                            BDT <?php echo number_format($row['grant_amount']); ?>
                                        </div>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr><td colspan="6" style="text-align:center; padding: 40px;">No Malaysia Scholarship applications yet.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>

                <?php elseif ($current_view == 'fees'): ?>
                <div style="padding: 20px;">
                    <form method="GET" style="margin-bottom: 20px; display: flex; gap: 10px;">
                        <input type="hidden" name="view" value="fees">
                        <select name="uni" class="form-control" style="padding: 10px; border-radius: 6px; border: 1px solid var(--border); width: 100%; max-width: 400px; font-family: inherit;" onchange="this.form.submit()">
                            <option value="">Select a University...</option>
                            <?php foreach ($fees_data as $key => $uni): ?>
                                <option value="<?php echo $key; ?>" <?php echo (isset($_GET['uni']) && $_GET['uni'] == $key) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($uni['title']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </form>
                    
                    <?php if (isset($_GET['uni']) && isset($fees_data[$_GET['uni']])): 
                        $uni = $fees_data[$_GET['uni']];
                    ?>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: var(--primary); margin: 0;"><?php echo htmlspecialchars($uni['title']); ?></h3>
                        <div>
                            <label class="switch-container">
                                <span class="switch-label">Developer Mode</span>
                                <div class="switch">
                                    <input type="checkbox" id="devModeToggle" onchange="toggleDevMode()">
                                    <span class="slider"></span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Admin GUI Mode -->
                    <div id="adminGuiMode">
                        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px;">To edit tables easily, we provide a visual editor. Admins can edit fields directly in the table below and click Save.</p>
                        
                        <form method="POST" action="admin.php">
                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                            <input type="hidden" name="action" value="save_fees">
                            <input type="hidden" name="uni_id" value="<?php echo htmlspecialchars($_GET['uni']); ?>">
                            <input type="hidden" name="fees_json" id="fees_json_hidden" value="">
                            
                            <div id="guiEditorContainer"></div>
                            
                            <button type="button" onclick="saveGuiChanges()" class="btn-primary" style="margin-top: 20px;"><i class="fas fa-save"></i> Save Changes</button>
                        </form>

                        <hr style="border: none; border-top: 1px solid var(--border); margin: 30px 0;">
                        
                        <h4>Manage PDFs</h4>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                        <?php 
                            $unique_pdfs = [];
                            foreach ($uni['categories'] as $cat) {
                                if (!empty($cat['pdf_link']) && !in_array($cat['pdf_link'], $unique_pdfs)) {
                                    $unique_pdfs[] = $cat['pdf_link'];
                                }
                            }
                        ?>
                        <?php foreach ($unique_pdfs as $pdf_link): ?>
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid var(--border); border-radius: 8px;">
                                    <div>
                                        <strong style="display: block; margin-bottom: 5px;">PDF Identifier: <?php echo htmlspecialchars($pdf_link); ?></strong>
                                        <span style="font-size: 0.85rem; color: #64748b;">Filename: <?php echo htmlspecialchars($pdf_link); ?>.pdf</span>
                                    </div>
                                    <button class="btn-outline" onclick="alert('PDF Upload requires a dedicated endpoint. This UI allows the admin to initiate the upload.')"><i class="fas fa-upload"></i> Replace PDF</button>
                                </div>
                        <?php endforeach; ?>
                        </div>
                    </div>

                    <!-- Developer Bulk Mode -->
                    <div id="devBulkMode" style="display: none;">
                        <form method="POST" action="admin.php">
                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                            <input type="hidden" name="action" value="save_fees">
                            <input type="hidden" name="uni_id" value="<?php echo htmlspecialchars($_GET['uni']); ?>">
                            <input type="hidden" name="fees_json" id="fees_json_hidden_dev" value="">
                            
                            <div class="form-group">
                                <label style="margin-bottom: 10px; display:block;">Bulk Edit JSON (<?php echo htmlspecialchars($uni['title']); ?>)</label>
                                <textarea id="devJsonArea" rows="25" style="width: 100%; font-family: monospace; padding: 15px; border-radius: 8px; border: 1px solid var(--border); background: #f8fafc; resize: vertical;"></textarea>
                            </div>
                            <button type="button" onclick="saveDevChanges()" class="btn-primary" style="background: #10b981;"><i class="fas fa-save"></i> Save Bulk JSON</button>
                        </form>
                    </div>

                    <!-- Script for GUI Editor -->
                    <script>
                        let uniData = <?php echo json_encode($uni); ?>;
                        let fullData = <?php echo json_encode($fees_data); ?>;
                        let uniId = "<?php echo $_GET['uni']; ?>";

                        function renderGuiEditor() {
                            let container = document.getElementById('guiEditorContainer');
                            let html = '';
                            
                            if (uniData.categories) {
                                uniData.categories.forEach((cat, catIndex) => {
                                    html += `<div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; overflow-x: auto;">`;
                                    html += `<h4 style="margin-top:0;">${cat.category_name || 'Programs'}</h4>`;
                                    
                                    if (cat.table && cat.table.rows) {
                                        html += `<table style="background: white; min-width: 800px;"><thead><tr>`;
                                        if (cat.table.headers) {
                                            cat.table.headers.forEach(h => { html += `<th>${h}</th>`; });
                                        }
                                        html += `<th width="50">Action</th></tr></thead><tbody>`;
                                        
                                        cat.table.rows.forEach((row, rowIndex) => {
                                            html += `<tr>`;
                                            row.forEach((cell, cellIndex) => {
                                                // Prevent quotes from breaking HTML input
                                                let safeCell = cell.toString().replace(/"/g, '&quot;');
                                                html += `<td><input type="text" value="${safeCell}" style="width: 100%; border: 1px solid #e2e8f0; padding: 8px; border-radius: 4px; font-family: inherit;" onchange="updateCell(${catIndex}, ${rowIndex}, ${cellIndex}, this.value)"></td>`;
                                            });
                                            html += `<td><button type="button" onclick="deleteRow(${catIndex}, ${rowIndex})" style="color: #ef4444; background: none; border: none; cursor: pointer; padding: 5px;"><i class="fas fa-trash"></i></button></td>`;
                                            html += `</tr>`;
                                        });
                                        html += `</tbody></table>`;
                                    }
                                    html += `<button type="button" onclick="addRow(${catIndex})" class="btn-outline" style="margin-top: 15px; font-size: 0.85rem;"><i class="fas fa-plus"></i> Add Row</button>`;
                                    html += `</div>`;
                                });
                            }
                            
                            container.innerHTML = html;
                            document.getElementById('devJsonArea').value = JSON.stringify(uniData, null, 2);
                        }
                        
                        function updateCell(catIdx, rowIdx, cellIdx, val) {
                            uniData.categories[catIdx].table.rows[rowIdx][cellIdx] = val;
                        }
                        
                        function deleteRow(catIdx, rowIdx) {
                            if (confirm("Delete this row?")) {
                                uniData.categories[catIdx].table.rows.splice(rowIdx, 1);
                                renderGuiEditor();
                            }
                        }
                        
                        function addRow(catIdx) {
                            let colCount = uniData.categories[catIdx].table.headers ? uniData.categories[catIdx].table.headers.length : uniData.categories[catIdx].table.rows[0].length;
                            let newRow = new Array(colCount).fill('');
                            uniData.categories[catIdx].table.rows.push(newRow);
                            renderGuiEditor();
                        }

                        function toggleDevMode() {
                            let adminGui = document.getElementById('adminGuiMode');
                            let devBulk = document.getElementById('devBulkMode');
                            if (adminGui.style.display === 'none') {
                                adminGui.style.display = 'block';
                                devBulk.style.display = 'none';
                            } else {
                                adminGui.style.display = 'none';
                                devBulk.style.display = 'block';
                            }
                        }

                        function saveGuiChanges() {
                            fullData[uniId] = uniData;
                            document.getElementById('fees_json_hidden').value = JSON.stringify(fullData);
                            document.getElementById('fees_json_hidden').form.submit();
                        }
                        
                        function saveDevChanges() {
                            try {
                                let newJson = JSON.parse(document.getElementById('devJsonArea').value);
                                fullData[uniId] = newJson;
                                document.getElementById('fees_json_hidden_dev').value = JSON.stringify(fullData);
                                document.getElementById('fees_json_hidden_dev').form.submit();
                            } catch(e) {
                                alert("Invalid JSON format. Please check your syntax.\n\nError: " + e.message);
                            }
                        }

                        renderGuiEditor();
                    </script>
                    <?php endif; ?>

                <?php elseif ($current_view == 'certificates'): ?>
                <table class="mobile-certificates">
                    <thead>
                        <tr>
                            <th width="15%">Cert Number</th>
                            <th width="25%">Student Name</th>
                            <th width="25%">Institution</th>
                            <th width="15%">Category & Pos</th>
                            <th width="10%">Issue Date</th>
                            <th width="10%" style="text-align: right;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($result->num_rows > 0): ?>
                            <?php while($row = $result->fetch_assoc()): ?>
                                <tr>
                                    <td><strong><?php echo htmlspecialchars($row['cert_number']); ?></strong></td>
                                    <td><?php echo $row['student_name'] ? htmlspecialchars($row['student_name']) : '<span style="color:#cbd5e1;">Not Set</span>'; ?></td>
                                    <td><?php echo $row['institution'] ? htmlspecialchars($row['institution']) : '<span style="color:#cbd5e1;">Not Set</span>'; ?></td>
                                    <td>
                                        <div style="font-weight: 600;"><?php echo htmlspecialchars($row['category']); ?></div>
                                        <div style="font-size: 0.85rem; color: #64748b;"><?php echo htmlspecialchars($row['position']); ?></div>
                                    </td>
                                    <td><?php echo $row['issue_date'] ? date('M d, Y', strtotime($row['issue_date'])) : '-'; ?></td>
                                    <td style="text-align: right;">
                                        <div class="dropdown">
                                            <button class="dropbtn"><i class="fas fa-ellipsis-v"></i></button>
                                            <div class="dropdown-content">
                                                <button onclick='openEditCertModal(<?php echo json_encode($row); ?>)'><i class="fas fa-edit"></i> Edit Details</button>
                                                <form method="POST" onsubmit="return confirm('Are you sure you want to delete this certificate?');" style="margin:0;">
                                                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                                    <input type="hidden" name="action" value="delete_cert">
                                                    <input type="hidden" name="cert_id" value="<?php echo $row['id']; ?>">
                                                    <button type="submit" class="text-danger"><i class="fas fa-trash"></i> Delete</button>
                                                </form>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr><td colspan="6" style="text-align:center; padding: 40px;">No certificates added yet.</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
                <?php endif; ?>

            </div>
            
            <?php 
            $total_pages = ceil($total_records / $limit);
            if ($total_pages > 1): 
                $q_params = $_GET;
            ?>
            <div class="pagination">
                <?php for($i=1; $i<=$total_pages; $i++): 
                    $q_params['page'] = $i;
                    $link = '?' . http_build_query($q_params);
                ?>
                    <a href="<?php echo $link; ?>" class="<?php echo ($page == $i) ? 'active' : ''; ?>"><?php echo $i; ?></a>
                <?php endfor; ?>
            </div>
            <?php endif; ?>
        </div>
    </main>

    <div id="receiptModal" class="modal-overlay" onclick="closeReceipt(event)">
        <div class="modal-container">
            <div class="close-btn" onclick="forceClose()">&times;</div>
            <div class="modal-content">
                <img id="modalImage" src="" alt="Student Receipt">
            </div>
        </div>
    </div>

    <script>
        const modal = document.getElementById('receiptModal');
        const modalImg = document.getElementById('modalImage');

        function showReceipt(url) {
            modalImg.src = url;
            modal.classList.add('active');
        }

        function closeReceipt(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => { modalImg.src = ''; }, 300);
            }
        }
        
        function forceClose() {
             modal.classList.remove('active');
        }
    </script>


    <div id="addCertModal" class="modal-overlay" onclick="closeModals(event)">
    <div class="modal-container" style="display: flex; justify-content: center;">
        <div class="form-modal" onclick="event.stopPropagation()">
            <h3>Add Certificate Number</h3>
            <form method="POST">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <input type="hidden" name="action" value="add_cert">
                <div class="form-group">
                    <label>Certificate ID / Number</label>
                    <input type="text" name="cert_number" required placeholder="e.g. OS-2026-1001">
                </div>
                <div class="form-group">
                    <label>Student Name</label>
                    <input type="text" name="student_name">
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" name="institution">
                </div>
                <div style="display: flex; gap: 10px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Category</label>
                        <select name="category">
                            <option value="Tier A">Tier A</option>
                            <option value="Tier B">Tier B</option>
                            <option value="Tier C">Tier C</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Position</label>
                        <select name="position">
                            <option value="Participant">Participant</option>
                            <option value="1st Place Winner">1st Place Winner</option>
                            <option value="2nd Place Winner">2nd Place Winner</option>
                            <option value="3rd Place Winner">3rd Place Winner</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Issue Date</label>
                    <input type="date" name="issue_date">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="forceCloseModals()">Cancel</button>
                    <button type="submit" class="btn-primary">Add</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div id="editCertModal" class="modal-overlay" onclick="closeModals(event)">
    <div class="modal-container" style="display: flex; justify-content: center;">
        <div class="form-modal" onclick="event.stopPropagation()">
            <h3>Edit Certificate Details</h3>
            <form method="POST">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <input type="hidden" name="action" value="edit_cert">
                <input type="hidden" name="cert_id" id="edit_cert_id">
                
                <div class="form-group">
                    <label>Certificate Number (Read-Only)</label>
                    <input type="text" id="edit_cert_number" readonly style="background: #f1f5f9;">
                </div>
                <div class="form-group">
                    <label>Student Name</label>
                    <input type="text" name="student_name" id="edit_student_name">
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" name="institution" id="edit_institution">
                </div>
                <div style="display: flex; gap: 10px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Category</label>
                        <select name="category" id="edit_category">
                            <option value="Tier A">Tier A</option>
                            <option value="Tier B">Tier B</option>
                            <option value="Tier C">Tier C</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Position</label>
                        <select name="position" id="edit_position">
                            <option value="1st Place Winner">1st Place Winner</option>
                            <option value="2nd Place Winner">2nd Place Winner</option>
                            <option value="3rd Place Winner">3rd Place Winner</option>
                            <option value="Participant">Participant</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Issue Date</label>
                    <input type="date" name="issue_date" id="edit_issue_date">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="forceCloseModals()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Details</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    // Extend your existing JS
    const addCertModal = document.getElementById('addCertModal');
    const editCertModal = document.getElementById('editCertModal');

    function openAddCertModal() {
        addCertModal.classList.add('active');
    }

    function openEditCertModal(data) {
        document.getElementById('edit_cert_id').value = data.id;
        document.getElementById('edit_cert_number').value = data.cert_number;
        document.getElementById('edit_student_name').value = data.student_name;
        document.getElementById('edit_institution').value = data.institution;
        document.getElementById('edit_category').value = data.category || 'Tier A';
        document.getElementById('edit_position').value = data.position || 'Participant';
        document.getElementById('edit_issue_date').value = data.issue_date;
        
        editCertModal.classList.add('active');
    }

    function closeModals(e) {
        if (e.target.classList.contains('modal-overlay')) {
            forceCloseModals();
        }
    }

    function forceCloseModals() {
        // Your existing image modal logic
        if(typeof modal !== 'undefined') modal.classList.remove('active');
        addCertModal.classList.remove('active');
        editCertModal.classList.remove('active');
    }
</script>
</body>
</html>
<?php $conn->close(); ?>