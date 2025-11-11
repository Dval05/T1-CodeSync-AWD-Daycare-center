$(document).ready(function() {
    const table = $('#gradesTable').DataTable({
        columns: [
            { data: 'GradeID' },
            { data: 'Name' },
            { data: null, orderable: false, render: function(row){
                return `
                    <button class=\"btn btn-warning btn-sm mr-1 btn-edit\" data-id=\"${row.GradeID}\">Editar</button>
                    <button class=\"btn btn-danger btn-sm btn-delete\" data-id=\"${row.GradeID}\">Eliminar</button>
                `;
            }}
        ]
    });

    function loadGrades(){
        $.get('../PHP/api/grades/list.php', function(resp){
            if (resp && resp.success && Array.isArray(resp.grades)) {
                table.clear().rows.add(resp.grades).draw();
            } else if (Array.isArray(resp)) {
                table.clear().rows.add(resp).draw();
            } else { table.clear().draw(); }
        }, 'json');
    }

    $('#addGradeBtn').on('click', function(){
        $('#gradeForm')[0].reset();
        $('#gradeId').val('');
        $('#gradeModal').modal('show');
    });

    $('#gradesTable').on('click', '.btn-edit', function(){
        const row = table.row($(this).parents('tr')).data();
        if (!row) return;
        $('#gradeId').val(row.GradeID);
        $('#gradeName').val(row.Name);
        $('#gradeModal').modal('show');
    });

    $('#gradeForm').on('submit', function(e){
        e.preventDefault();
        const id = $('#gradeId').val();
        const url = id ? '../PHP/api/grades/update.php' : '../PHP/api/grades/create.php';
        $.post(url, $(this).serialize(), function(resp){
            if (resp && resp.success) {
                $('#gradeModal').modal('hide');
                loadGrades();
            } else { alert(resp.message || 'No se pudo guardar'); }
        }, 'json').fail(function(){ alert('Error de red'); });
    });

    $('#gradesTable').on('click', '.btn-delete', function(){
        const id = $(this).data('id');
        if (!confirm('¿Eliminar grado?')) return;
        $.post('../PHP/api/grades/delete.php', { GradeID: id }, function(resp){
            if (resp && resp.success) loadGrades(); else alert(resp.message || 'No se pudo eliminar');
        }, 'json').fail(function(){ alert('Error de red'); });
    });

    loadGrades();
});

