$(document).ready(function() {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();

        const username = $('#username').val().trim();
        const password = $('#password').val();
        const rememberMe = $('#rememberMe').is(':checked');

        $('#loginBtn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...');

		$.ajax({
			url: '../PHP/auth/login.php', // Ajustado a ruta real (Windows no distingue, Linux sí)
            method: 'POST',
            data: {
                username: username,
                password: password,
                rememberMe: rememberMe
            },
            success: function(response) {
                let res = typeof response === "object" ? response : JSON.parse(response);
                if (res.success) {
                    // Estos datos deben estar en response (json del backend)
                    localStorage.setItem("authToken", res.token); // o res.AuthToken según lo que tu backend devuelva
                    localStorage.setItem("userName", res.userName || username);
                    localStorage.setItem("userRole", res.role || "Director");
                    showAlert('success', '¡Inicio de sesión exitoso! Redirigiendo...');
                    setTimeout(function() {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showAlert('danger', res.msg || 'Usuario o contraseña incorrectos');
                    $('#loginBtn').prop('disabled', false).html('<i class="fas fa-sign-in-alt"></i> Iniciar Sesión');
                }
            },
            error: function(xhr, status, error) {
                showAlert('danger', 'Error al conectar con el servidor.');
                $('#loginBtn').prop('disabled', false).html('<i class="fas fa-sign-in-alt"></i> Iniciar Sesión');
            }
        });
    });

    function showAlert(type, message) {
        const alertDiv = $('#alertMessage');
        alertDiv.removeClass('alert-success alert-danger');
        alertDiv.addClass('alert-' + type);
        $('#alertText').text(message);
        alertDiv.show();
        if (type === 'success') {
            setTimeout(function() {
                alertDiv.hide();
            }, 3000);
        }
    }
});
