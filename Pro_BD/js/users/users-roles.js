$(function(){
  requireAuth();
  $.get(API_BASE_URL+"/users/get_all.php",function(r){
    let b="";
    if(r.success&&r.data.length){
      r.data.forEach(u=>{
        b+=`<tr>
          <td>${u.FirstName} ${u.LastName}</td><td>${u.Email}</td>
          <td>${u.Role}</td><td>${u.IsActive?"Sí":"No"}</td>
          <td>${u.LastLogin}</td>
          <td><a href="#" class="btn btn-info btn-sm">Editar</a></td>
        </tr>`;
      });
    } else b='<tr><td colspan="6" class="text-center">Sin usuarios</td></tr>';
    $("#usersTableBody").html(b);
  });
  $.get(API_BASE_URL+"/roles/get_all.php",function(r){
    let b="";
    if(r.success&&r.data.length){
      r.data.forEach(r=>{
        b+=`<tr>
          <td>${r.RoleName}</td><td>${r.Description}</td>
          <td>${r.IsActive?"Sí":"No"}</td>
          <td><a href="#" class="btn btn-info btn-sm">Editar</a></td></tr>`;
      });
    } else b='<tr><td colspan="4" class="text-center">Sin roles</td></tr>';
    $("#rolesTableBody").html(b);
  });
});
