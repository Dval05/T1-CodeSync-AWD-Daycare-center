$(document).ready(function() {
    $('#attendanceForm').on('submit', function(e) {
        e.preventDefault();
        const date = $('#attendanceDate').val();
        if (!date) return alert('Selecciona una fecha.');
        // Endpoint placeholder (crear si no existe)
        $.post('../PHP/api/attendance/record.php', { date }, function(resp) {
            // Manejo simple
            alert(resp.message || 'Registrado');
        }, 'json');
    });
});

