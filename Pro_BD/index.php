<?php
session_start();
// Check if user_id is NOT set in session
if (!isset($_SESSION['user_id'])) {
    // If not logged in, redirect to login.html
    header("Location: login.html");
    exit(); // Always exit after a header redirect
} else {
    // If logged in, redirect to dashboard.html
    header("Location: HTML/dashboard.html");
    exit(); // Always exit after a header redirect
}
?>