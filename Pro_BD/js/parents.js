$(document).ready(function() {
    const table = $('#parentsTable').DataTable({
        columns: [
            { data: 'GuardID' },
            { data: 'FirstName' },
            { data: 'LastName' },
            { data: null, orderable: false, render: function(row){
                return `
                    <button class="btn btn-warning btn-sm mr-1 btn-edit" data-id="${row.GuardID}">Editar</button>
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${row.GuardID}">Eliminar</button>
                `;
            }}
        ]
    });

    function loadParents(){
        $.get('../PHP/api/parents/list.php', function(resp){
            if (resp && resp.success && Array.isArray(resp.parents)) {
                table.clear().rows.add(resp.parents).draw();
            } else { table.clear().draw(); }
        }, 'json');
    }

    $('#addParentBtn').on('click', function(){
        $('#parentForm')[0].reset();
        $('#parentId').val('');
        $('#parentModal').modal('show');
    });

    $('#parentsTable').on('click', '.btn-edit', function(){
        const row = table.row($(this).parents('tr')).data();
        if (!row) return;
        $('#parentId').val(row.GuardID);
        $('#parentFirstName').val(row.FirstName);
        $('#parentLastName').val(row.LastName);
        $('#parentModal').modal('show');
    });

    $('#parentForm').on('submit', function(e){
        e.preventDefault();
        const id = $('#parentId').val();
        const url = id ? '../PHP/api/parents/update.php' : '../PHP/api/parents/create.php';
        $.post(url, $(this).serialize(), function(resp){
            if (resp && resp.success) {
                $('#parentModal').modal('hide');
                loadParents();
            } else { alert(resp.message || 'No se pudo guardar'); }
        }, 'json').fail(function(){ alert('Error de red'); });
    });

    $('#parentsTable').on('click', '.btn-delete', function(){
        const id = $(this).data('id');
        if (!confirm('¿Eliminar padre/tutor?')) return;
        $.post('../PHP/api/parents/delete.php', { GuardID: id }, function(resp){
            if (resp && resp.success) loadParents(); else alert(resp.message || 'No se pudo eliminar');
        }, 'json').fail(function(){ alert('Error de red'); });
    });

    loadParents();
});

