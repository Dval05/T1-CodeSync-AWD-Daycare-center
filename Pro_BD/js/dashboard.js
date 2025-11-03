// js/dashboard.js

// Make sure to define KINDERGARTEN_NAME if it's not globally available from dynamic-sidebar.js or similar
// For robustness, you might want to fetch this from a PHP endpoint too, or embed in a meta tag.
// For now, let's assume it's defined or directly hardcode if necessary for dashboard text.
if (typeof KINDERGARTEN_NAME === 'undefined') {
    const KINDERGARTEN_NAME = "NICEKIDS"; // Fallback if not globally defined
}

$(document).ready(function() {

    // Function to fetch and update dashboard statistics
    function fetchDashboardStats() {
        // Total estudiantes
        $.ajax({
            url: '../PHP/api/students/list.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && response.students) {
                    $('#totalStudents').text(response.students.length);
                } else {
                    $('#totalStudents').text('N/A');
                    console.error("Error fetching total students:", response.message);
                }
            },
            error: function(xhr, status, error) {
                $('#totalStudents').text('Error');
                console.error("AJAX error fetching total students:", status, error);
            }
        });

        // Asistencia de hoy
        $.ajax({
            url: '../PHP/api/attendance/daily_report.php',
            type: 'GET',
            data: { date: new Date().toISOString().slice(0,10) }, // Send today's date
            dataType: 'json',
            success: function(response) {
                if (response.success && Array.isArray(response.report)) {
                    const presentCount = response.report.filter(r => (r.Status || '').toLowerCase() === 'present').length;
                    $('#presentToday').text(presentCount);
                } else {
                    $('#presentToday').text('N/A');
                }
            },
            error: function(xhr, status, error) {
                $('#presentToday').text('Error');
                
            }
        });

        // Fetch Scheduled Activities (FR-9 for activity calendar)
        $.ajax({
            url: '../PHP/api/activities/list.php',
            type: 'GET',
            // You might add parameters like { startDate: today, endDate: today }
            dataType: 'json',
            success: function(response) {
                if (response.success && Array.isArray(response.activities)) {
                    // Assuming data is an array of activities for today or a relevant period
                    // For a simple count, just use the array length. For more specific, filter by date.
                    const today = new Date().toISOString().slice(0,10);
                    const dailyActivities = response.activities.filter(activity => {
                        // This filtering depends on how your activity object looks.
                        // Assuming activity has a 'ScheduledDate' or similar property.
                        // For simplicity, let's just count all for now.
                        return true;
                    });
                    $('#upcomingActivities').text(dailyActivities.length);
                } else {
                    $('#upcomingActivities').text('N/A');
                }
            },
            error: function(xhr, status, error) {
                $('#upcomingActivities').text('Error');
                
            }
        });

        // Fetch New Messages (FR-12 for internal messaging)
        $.ajax({
            url: '../PHP/api/communication/inbox.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && Array.isArray(response.messages)) {
                    const unreadMessages = response.messages.filter(msg => (parseInt(msg.IsRead, 10) || 0) === 0);
                    $('#newMessages').text(unreadMessages.length);
                    updateMessageDropdown(unreadMessages);
                } else {
                    $('#newMessages').text('N/A');
                }
            },
            error: function(xhr, status, error) {
                $('#newMessages').text('Error');
                
            }
        });

        // Fetch Notifications (FR-13 for notification center)
        $.ajax({
            url: '../PHP/api/notifications/list.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && Array.isArray(response.notifications)) {
                    const unreadNotifications = response.notifications.filter(notif => (parseInt(notif.IsRead, 10) || 0) === 0);
                    $('#notificationCounter').text(unreadNotifications.length > 0 ? unreadNotifications.length + '+' : '0');
                    $('#pendingNotifications').text(unreadNotifications.length);
                    // Update topbar dropdown
                    updateNotificationDropdown(unreadNotifications);
                } else {
                    $('#notificationCounter').text('0+');
                    $('#pendingNotifications').text('0');
                }
            },
            error: function(xhr, status, error) {
                $('#notificationCounter').text('Error');
                
            }
        });
    }

    // Function to populate the topbar messages dropdown
    function updateMessageDropdown(messages) {
        const dropdown = $('#messageDropdown');
        dropdown.find('.dropdown-item:not(.dropdown-header, .text-center)').remove(); // Remove old messages
        
        if (messages.length > 0) {
            messages.slice(0, 3).forEach(function(msg) { // Show up to 3 latest unread messages
                dropdown.prepend(`
                    <a class="dropdown-item d-flex align-items-center" href="communication.html?messageId=${msg.MessageID}">
                        <div class="dropdown-list-image mr-3">
                            <img class="rounded-circle" src="../img/undraw_profile_1.svg" alt="...">
                            <div class="status-indicator bg-success"></div>
                        </div>
                        <div class="font-weight-bold">
                            <div class="text-truncate">${msg.Message}</div>
                            <div class="small text-gray-500">${msg.SenderName} · ${timeAgo(new Date(msg.SentAt))}</div>
                        </div>
                    </a>
                `);
            });
        } else {
            dropdown.prepend(`<a class="dropdown-item text-center small text-gray-500">No tienes mensajes nuevos.</a>`);
        }
    }

    // Function to populate the topbar alerts/notifications dropdown
    function updateNotificationDropdown(notifications) {
        const dropdown = $('#notificationDropdown');
        dropdown.find('.dropdown-item:not(.dropdown-header, .text-center)').remove(); // Remove old notifications

        if (notifications.length > 0) {
            notifications.slice(0, 3).forEach(function(notif) { // Show up to 3 latest unread notifications
                let iconClass = 'fas fa-file-alt'; // Default icon
                let bgColorClass = 'bg-primary'; // Default color

                // Customize icon/color based on notification type if available
                if (notif.Type === 'alert') {
                    iconClass = 'fas fa-exclamation-triangle';
                    bgColorClass = 'bg-warning';
                } else if (notif.Type === 'payment') {
                    iconClass = 'fas fa-dollar-sign';
                    bgColorClass = 'bg-success';
                }
                
                dropdown.prepend(`
                    <a class="dropdown-item d-flex align-items-center" href="notifications.html?notificationId=${notif.NotificationID}">
                        <div class="mr-3">
                            <div class="icon-circle ${bgColorClass}">
                                <i class="${iconClass} text-white"></i>
                            </div>
                        </div>
                        <div>
                            <div class="small text-gray-500">${new Date(notif.SentAt).toLocaleDateString()}</div>
                            <span class="font-weight-bold">${notif.Message}</span>
                        </div>
                    </a>
                `);
            });
        } else {
            dropdown.prepend(`<a class="dropdown-item text-center small text-gray-500">No tienes alertas o notificaciones nuevas.</a>`);
        }
    }

    // Utility function to format time ago (optional, can be replaced by a library like moment.js)
    function timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " años";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " meses";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " días";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " horas";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutos";
        return Math.floor(seconds) + " segundos";
    }

    // Initial fetch of dashboard stats and topbar info
    fetchDashboardStats();

    // Set interval to refresh stats periodically (e.g., every 5 minutes)
    setInterval(fetchDashboardStats, 300000); // 300000 ms = 5 minutes

    // Update the username in the topbar
    function updateTopbarUser() {
        $.ajax({
            url: '../PHP/auth.php?action=check_session',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.active) {
                    $('#topbarUsername').text(response.username);
                } else {
                    window.location.href = '../login.html?timeout=1';
                }
            },
            error: function(xhr, status, error) {}
        });
    }

    updateTopbarUser(); // Call on page load
    setInterval(updateTopbarUser, 60000); // Check session every minute (FR-16)

});