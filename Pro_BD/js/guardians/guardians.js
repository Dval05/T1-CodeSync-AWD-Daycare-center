$(function(){
  requireAuth();
  $.get(API_BASE_URL+"/guardians/get_all.php",d=>{
    let b="";
    if(d.success&&d.data.length){
      d.data.forEach(g=>{
        b+=`<tr>
          <td>${g.GuardianID}</td>
          <td>${g.FirstName} ${g.LastName}</td>
          <td>${g.Relationship}</td>
          <td>${g.PhoneNumber||"-"}</td>
          <td>${g.Email||"-"}</td>
          <td>${g.Students||""}</td>
          <td>${g.IsPrimary?"Sí":"No"}</td>
          <td><a class="btn btn-info btn-sm" href="guardian-detail.html?guardianId=${g.GuardianID}"><i class="fas fa-eye"></i></a></td>
        </tr>`;
      });
    } else b='<tr><td colspan="8" class="text-center text-muted">Sin tutores</td></tr>';
    $("#guardiansTableBody").html(b);
  });
});
