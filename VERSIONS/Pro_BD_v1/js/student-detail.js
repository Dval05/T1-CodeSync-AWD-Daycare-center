// js/student-detail.js
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const studId = urlParams.get('id');

    if (!studId) {
        $('#studentDetailTitle').text('Error: ID de estudiante no proporcionado');
        // Hide all content or redirect
        $('.container-fluid').html('<div class="alert alert-danger">Error: ID de estudiante no proporcionado. <a href="students.html">Volver a la lista de estudiantes</a></div>');
        return;
    }

    // Set the student ID for modals and links
    $('#editStudentId').val(studId);
    $('#observationStudentId').val(studId);
    $('#viewAllAttendanceBtn').attr('href', 'attendance.html?studid=' + studId);

    // Function to load grades for dropdowns
    function loadGradesForDropdown(selector, selectedGradeId = null) {
        return $.ajax({
            url: '../PHP/api/grades/list.php',
            method: 'GET',
            dataType: 'json',
            success: function(grades) {
                var gradeSelect = $(selector);
                gradeSelect.empty();
                if (grades.length === 0) {
                    gradeSelect.append($('<option>', { value: '', text: 'No hay grados disponibles' }));
                } else {
                    gradeSelect.append($('<option>', { value: '', text: 'Selecciona un grado' })); // Default option
                    $.each(grades, function(i, grade) {
                        gradeSelect.append($('<option>', {
                            value: grade.GradeID,
                            text: grade.Name
                        }));
                    });
                    if (selectedGradeId) {
                        gradeSelect.val(selectedGradeId);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error("Error loading grades:", status, error);
                $(selector).empty().append($('<option>', { value: '', text: 'Error al cargar grados' }));
            }
        });
    }

    // Function to load all student details
    function loadStudentDetails() {
        $.ajax({
            url: '../PHP/api/students/get.php?id=' + studId,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.student) {
                    $('#studentDetailTitle').text('Detalle de ' + data.student.FirstName + ' ' + data.student.LastName);
                    $('#studentNameDisplay').text(data.student.FirstName + ' ' + data.student.LastName);
                    $('#studentIdDisplay').text(data.student.StudID);
                    $('#studentGradeDisplay').text(data.student.GradeName ? 'Grado: ' + data.student.GradeName : 'Grado no asignado');

                    // Populate edit modal
                    $('#editFirstName').val(data.student.FirstName);
                    $('#editLastName').val(data.student.LastName);
                    loadGradesForDropdown('#editGradeId', data.student.GradeID);

                    // Guardians
                    var guardianList = $('#guardianList');
                    guardianList.empty();
                    if (data.guardians && data.guardians.length > 0) {
                        $.each(data.guardians, function(i, guardian) {
                            guardianList.append('<li class="list-group-item">' + guardian.FirstName + ' ' + guardian.LastName + '</li>');
                        });
                    } else {
                        guardianList.append('<li class="list-group-item">No hay tutores asignados.</li>');
                    }
                } else {
                    $('#studentDetailTitle').text('Estudiante no encontrado');
                    // Handle case where student is not found
                    $('.container-fluid').html('<div class="alert alert-warning">Estudiante no encontrado. <a href="students.html">Volver a la lista de estudiantes</a></div>');
                }
            },
            error: function(xhr, status, error) {
                console.error("Error loading student details:", status, error);
                $('#studentDetailTitle').text('Error al cargar detalles del estudiante');
                $('.container-fluid').html('<div class="alert alert-danger">Error al cargar detalles del estudiante. Inténtalo de nuevo.</div>');
            }
        });
    }

    // Function to load recent attendance
    function loadRecentAttendance() {
        $.ajax({
            url: '../PHP/api/attendance/recent.php?studid=' + studId,
            method: 'GET',
            dataType: 'json',
            success: function(attendanceData) {
                var attendanceTableBody = $('#recentAttendanceTable tbody');
                attendanceTableBody.empty();
                if (attendanceData.length > 0) {
                    $.each(attendanceData, function(i, record) {
                        attendanceTableBody.append(
                            '<tr>' +
                                '<td>' + record.Date + '</td>' +
                                '<td>' + record.Status + '</td>' +
                                '<td>' + (record.EmployeeName || 'N/A') + '</td>' +
                            '</tr>'
                        );
                    });
                } else {
                    attendanceTableBody.append('<tr><td colspan="3" class="text-center">No hay registros de asistencia recientes.</td></tr>');
                }
            },
            error: function(xhr, status, error) {
                console.error("Error loading recent attendance:", status, error);
                $('#recentAttendanceTable tbody').html('<tr><td colspan="3" class="text-center text-danger">Error al cargar asistencia.</td></tr>');
            }
        });
    }

    // Function to load observations
    function loadObservations() {
        $.ajax({
            url: '../PHP/api/observations/list.php?studid=' + studId,
            method: 'GET',
            dataType: 'json',
            success: function(observations) {
                var observationsContainer = $('#observationsContainer');
                observationsContainer.empty();
                if (observations.length > 0) {
                    $.each(observations, function(i, obs) {
                        observationsContainer.append(
                            '<div class="card mb-3">' +
                                '<div class="card-body">' +
                                    '<h5 class="card-title">' + obs.ObservationDate + ' <small class="text-muted">por ' + (obs.EmployeeName || 'Desconocido') + '</small></h5>' +
                                    '<p class="card-text">' + obs.ObservationText + '</p>' +
                                    // Optionally add edit/delete buttons for observations if permissions allow
                                    // '<button class="btn btn-warning btn-sm mr-2 edit-observation-btn" data-id="' + obs.ObservationID + '">Editar</button>' +
                                    // '<button class="btn btn-danger btn-sm delete-observation-btn" data-id="' + obs.ObservationID + '">Eliminar</button>' +
                                '</div>' +
                            '</div>'
                        );
                    });
                } else {
                    observationsContainer.append('<p class="text-center">No hay observaciones registradas para este estudiante.</p>');
                }
            },
            error: function(xhr, status, error) {
                console.error("Error loading observations:", status, error);
                $('#observationsContainer').html('<p class="text-center text-danger">Error al cargar observaciones.</p>');
            }
        });
    }

    // Function to load progress reports (placeholder)
    function loadProgressReports() {
        // This would ideally fetch actual report links or content
        $('#progressReportsContainer').html('<p>No hay reportes de progreso disponibles. Genera uno nuevo.</p>');
        // Example:
        // $.ajax({
        //     url: 'php/api/reports/list.php?studid=' + studId,
        //     method: 'GET',
        //     dataType: 'json',
        //     success: function(reports) {
        //         if (reports.length > 0) {
        //             var reportHtml = '<h6>Reportes Generados:</h6><ul>';
        //             $.each(reports, function(i, report) {
        //                 reportHtml += '<li><a href="' + report.FilePath + '" target="_blank">' + report.Title + ' (' + report.Date + ')</a></li>';
        //             });
        //             reportHtml += '</ul>';
        //             $('#progressReportsContainer').html(reportHtml);
        //         } else {
        //             $('#progressReportsContainer').html('<p>No hay reportes de progreso disponibles. Genera uno nuevo.</p>');
        //         }
        //     }
        // });
    }


    // Initial data load
    loadStudentDetails();
    loadRecentAttendance();
    loadObservations();
    loadProgressReports();

    // Event Listeners for Modals and Forms

    // Edit Student Profile Button
    $('#editStudentProfileBtn').on('click', function() {
        // Details are already loaded, just show the modal
        $('#editStudentModal').modal('show');
    });

    // Submit Edit Student Form
    $('#editStudentForm').on('submit', function(e) {
        e.preventDefault();
        var formData = $(this).serializeArray();
        $.ajax({
            url: '../PHP/api/students/update.php',
            method: 'POST',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    $('#editStudentModal').modal('hide');
                    loadStudentDetails(); // Reload to show updated info
                    alert(response.message);
                } else {
                    alert('Error al actualizar estudiante: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error updating student:", status, error);
                alert("Ocurrió un error al actualizar el estudiante.");
            }
        });
    });

    // Add Observation Button
    $('#addObservationBtn').on('click', function() {
        $('#addObservationForm')[0].reset();
        $('#observationDate').val(new Date().toISOString().slice(0, 10)); // Set today's date
        $('#addObservationModal').modal('show');
    });

    // Submit Add Observation Form
    $('#addObservationForm').on('submit', function(e) {
        e.preventDefault();
        var formData = $(this).serializeArray();
        $.ajax({
            url: '../PHP/api/observations/create.php',
            method: 'POST',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    $('#addObservationModal').modal('hide');
                    loadObservations(); // Reload observations
                    alert(response.message);
                } else {
                    alert('Error al añadir observación: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error adding observation:", status, error);
                alert("Ocurrió un error al añadir la observación.");
            }
        });
    });

    // Generate Report Button (Placeholder)
    $('#generateReportBtn').on('click', function() {
        alert('Funcionalidad de generación de reportes aún no implementada.');
        // In a real scenario, this would trigger an AJAX call to generate a PDF/document
        // e.g., window.open('php/api/reports/generate.php?studid=' + studId, '_blank');
    });

    // To ensure DataTables scripts are loaded if they are used on this page
    // if ($.fn.DataTable) {
    //     // Initialize DataTables for attendance or observations if needed
    // }
});