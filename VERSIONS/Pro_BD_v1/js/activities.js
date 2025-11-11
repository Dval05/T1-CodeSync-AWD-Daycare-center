$(document).ready(function() {
    const table = $('#activitiesTable').DataTable({
        columns: [
            { data: 'ActivityID' },
            { data: 'Name' },
            { data: 'GradeID', defaultContent: '' },
            { data: 'EmpID', defaultContent: '' },
            { data: 'ImagePath', render: function(path) {
                if (!path) return '';
                return `<img src="${path}" alt="img" style="height:40px">`;
            }},
            { data: null, orderable: false, render: function(row) {
                return `
                    <button class="btn btn-warning btn-sm mr-1 btn-edit" data-id="${row.ActivityID}">Editar</button>
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${row.ActivityID}">Eliminar</button>
                `;
            }}
        ]
    });

    function loadActivities() {
        $.ajax({
            url: '../PHP/api/activities/list.php',
            type: 'GET',
            dataType: 'json',
            success: function(resp) {
                if (resp.success && Array.isArray(resp.activities)) {
                    table.clear().rows.add(resp.activities).draw();
                } else {
                    table.clear().draw();
                }
            },
            error: function() { table.clear().draw(); }
        });
    }

    // Add button
    $('#addActivityBtn').on('click', function() {
        $('#activityForm')[0].reset();
        $('#activityId').val('');
        $('#currentActivityImage').empty();
        $('#activityModal').modal('show');
    });

    // Edit button
    $('#activitiesTable').on('click', '.btn-edit', function() {
        const row = table.row($(this).parents('tr')).data();
        if (!row) return;
        $('#activityId').val(row.ActivityID);
        $('#activityName').val(row.Name);
        // GradeID, EmpID podrían precargarse si tienes endpoints de listas
        if (row.ImagePath) {
            $('#currentActivityImage').html(`<img src="${row.ImagePath}" style="height:60px">`);
        } else {
            $('#currentActivityImage').empty();
        }
        $('#activityModal').modal('show');
    });

    // Submit form (placeholder; requiere endpoints create/update/upload_image)
    $('#activityForm').on('submit', function(e) {
        e.preventDefault();
        const id = $('#activityId').val();
        const url = id ? '../PHP/api/activities/update.php' : '../PHP/api/activities/create.php';
        const formData = new FormData(this);
        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(resp) {
                if (resp.success) {
                    $('#activityModal').modal('hide');
                    loadActivities();
                } else {
                    alert(resp.message || 'No se pudo guardar');
                }
            },
            error: function() { alert('Error de red'); }
        });
    });

    // Delete button (placeholder; requiere endpoint delete)
    $('#activitiesTable').on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        if (!confirm('¿Eliminar actividad?')) return;
        $.post('../PHP/api/activities/delete.php', { ActivityID: id }, function(resp) {
            if (resp && resp.success) { loadActivities(); } else { alert(resp.message || 'No se pudo eliminar'); }
        }, 'json').fail(function(){ alert('Error de red'); });
    });

    loadActivities();
});


