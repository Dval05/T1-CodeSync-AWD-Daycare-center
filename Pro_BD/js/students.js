// js/students.js
$(document).ready(function() {
    const table = $('#studentsTable').DataTable({
        columns: [
            { data: 'StudID' },
            { data: 'FirstName' },
            { data: 'LastName' },
            { data: 'GradeName', defaultContent: '' },
            {
                data: null,
                orderable: false,
                render: function(row) {
                    return `
                        <a href="student-detail.html?id=${row.StudID}" class="btn btn-info btn-sm mr-1">Ver</a>
                        <button class="btn btn-warning btn-sm mr-1 btn-edit" data-id="${row.StudID}">Editar</button>
                        <button class="btn btn-danger btn-sm btn-delete" data-id="${row.StudID}">Eliminar</button>
                    `;
                }
            }
        ]
    });

    function loadGrades() {
        return $.ajax({
            url: '../PHP/api/grades/list.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                const select = $('#gradeId');
                select.empty();
                if (response && Array.isArray(response)) {
                    select.append('<option value="">Selecciona un grado</option>');
                    response.forEach(g => select.append(`<option value="${g.GradeID}">${g.Name}</option>`));
                } else if (response.success && response.data) {
                    select.append('<option value="">Selecciona un grado</option>');
                    response.data.forEach(g => select.append(`<option value="${g.GradeID}">${g.Name}</option>`));
                } else {
                    select.append('<option value="">No hay grados</option>');
                }
            }
        });
    }

    function loadStudents() {
        $.ajax({
            url: '../PHP/api/students/list.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && response.students) {
                    table.clear().rows.add(response.students).draw();
                } else {
                    table.clear().draw();
                }
            },
            error: function() {
                table.clear().draw();
            }
        });
    }

    // Open modal add
    $('#addStudentBtn').on('click', function() {
        $('#studentForm')[0].reset();
        $('#studentId').val('');
        loadGrades().then(() => $('#studentModal').modal('show'));
    });

    // Edit
    $('#studentsTable').on('click', '.btn-edit', function() {
        const id = $(this).data('id');
        const row = table.row($(this).parents('tr')).data();
        $('#studentId').val(id);
        $('#firstName').val(row.FirstName);
        $('#lastName').val(row.LastName);
        loadGrades().then(() => {
            if (row.GradeID) $('#gradeId').val(row.GradeID);
            $('#studentModal').modal('show');
        });
    });

    // Delete
    $('#studentsTable').on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        if (!confirm('¿Eliminar estudiante?')) return;
        $.ajax({
            url: '../PHP/api/students/delete.php',
            type: 'POST',
            dataType: 'json',
            data: { StudID: id },
            success: function(resp) {
                if (resp.success) {
                    loadStudents();
                } else {
                    alert(resp.message || 'No se pudo eliminar');
                }
            },
            error: function() { alert('Error de red al eliminar'); }
        });
    });

    // Submit create/update
    $('#studentForm').on('submit', function(e) {
        e.preventDefault();
        const formData = $(this).serialize();
        const id = $('#studentId').val();
        const url = id ? '../PHP/api/students/update.php' : '../PHP/api/students/create.php';
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: formData,
            success: function(resp) {
                if (resp.success) {
                    $('#studentModal').modal('hide');
                    loadStudents();
                } else {
                    alert(resp.message || 'No se pudo guardar');
                }
            },
            error: function() { alert('Error de red al guardar'); }
        });
    });

    // Initial load
    loadStudents();
});


