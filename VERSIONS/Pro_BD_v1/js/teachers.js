$(document).ready(function() {
    const table = $('#teachersTable').DataTable({
        columns: [
            { data: 'EmpID' },
            { data: 'FirstName' },
            { data: 'LastName' },
            { data: null, orderable: false, render: function(row){
                return `
                    <button class="btn btn-warning btn-sm mr-1 btn-edit" data-id="${row.EmpID}">Editar</button>
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${row.EmpID}">Eliminar</button>
                `;
            }}
        ]
    });

    function loadTeachers(){
        $.get('../PHP/api/teachers/list.php', function(resp){
            if (resp && resp.success && Array.isArray(resp.teachers)) {
                table.clear().rows.add(resp.teachers).draw();
            } else { table.clear().draw(); }
        }, 'json');
    }

    $('#addTeacherBtn').on('click', function(){
        $('#teacherForm')[0].reset();
        $('#teacherId').val('');
        $('#teacherModal').modal('show');
    });

    $('#teachersTable').on('click', '.btn-edit', function(){
        const row = table.row($(this).parents('tr')).data();
        if (!row) return;
        $('#teacherId').val(row.EmpID);
        $('#teacherFirstName').val(row.FirstName);
        $('#teacherLastName').val(row.LastName);
        $('#teacherModal').modal('show');
    });

    $('#teacherForm').on('submit', function(e){
        e.preventDefault();
        const id = $('#teacherId').val();
        const url = id ? '../PHP/api/teachers/update.php' : '../PHP/api/teachers/create.php';
        $.post(url, $(this).serialize(), function(resp){
            if (resp && resp.success) {
                $('#teacherModal').modal('hide');
                loadTeachers();
            } else { alert(resp.message || 'No se pudo guardar'); }
        }, 'json').fail(function(){ alert('Error de red'); });
    });

    $('#teachersTable').on('click', '.btn-delete', function(){
        const id = $(this).data('id');
        if (!confirm('¿Eliminar maestro?')) return;
        $.post('../PHP/api/teachers/delete.php', { EmpID: id }, function(resp){
            if (resp && resp.success) loadTeachers(); else alert(resp.message || 'No se pudo eliminar');
        }, 'json').fail(function(){ alert('Error de red'); });
    });

    loadTeachers();
});

