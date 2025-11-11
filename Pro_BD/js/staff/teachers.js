$(function(){
  requireAuth();
  $.get(API_BASE_URL+"/employees/get_all.php",d=>{
    let b="";
    if(d.success&&d.data.length){
      d.data.forEach(e=>{
        b+=`<tr>
          <td>${e.EmpID}</td>
          <td><img src="${e.ProfilePicture||'../img/undraw_profile.svg'}" width="32" class="rounded-circle"></td>
          <td>${e.FirstName} ${e.LastName}</td>
          <td>${e.Email||"-"}</td>
          <td>${e.PhoneNumber||"-"}</td>
          <td>${e.Position}</td>
          <td><span class="badge badge-${e.IsActive?"success":"secondary"}">${e.IsActive?"Activo":"Inactivo"}</span></td>
          <td><a class="btn btn-info btn-sm" href="teacher-detail.html?empId=${e.EmpID}"><i class="fas fa-eye"></i></a></td>
        </tr>`;
      });
    } else b='<tr><td colspan="8" class="text-center text-muted">Sin docentes</td></tr>';
    $("#teachersTableBody").html(b);
  });
});
