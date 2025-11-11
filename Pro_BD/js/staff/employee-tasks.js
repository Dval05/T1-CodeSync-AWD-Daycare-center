$(function(){
  requireAuth();
  const urlParams=new URLSearchParams(window.location.search);
  const empId=urlParams.get('empId');
  $.get(API_BASE_URL+"/employees/get_tasks.php",{empId:empId},d=>{
    let b="";
    if(d.success&&d.data.length){
      d.data.forEach(t=>{
        b+=`<tr>
          <td>${t.TaskName}</td><td>${t.DueDate||"-"}</td><td>${t.Status}</td><td>${t.Priority}</td>
          <td><a class="btn btn-info btn-sm" href="#">Ver</a></td></tr>`;
      });
    } else b='<tr><td colspan="5" class="text-center text-muted">Sin tareas</td></tr>';
    $("#tasksTable").html(b);
  });
});
