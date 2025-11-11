$(function(){
  requireAuth();
  $.get(API_BASE_URL+"/grades/get_all.php",function(r){
    let b="";
    if(r.success&&r.data.length){
      r.data.forEach(g=>{
        b+=`<tr>
          <td>${g.GradeID}</td><td>${g.GradeName}</td>
          <td>${g.AgeRangeMin} - ${g.AgeRangeMax}</td>
          <td>${g.MaxCapacity||"-"}</td>
          <td>${g.IsActive?"Activo":"Inactivo"}</td>
          <td><a class="btn btn-info btn-sm" href="grade-students.html?gradeId=${g.GradeID}">Estudiantes</a></td>
        </tr>`;
      });
    } else b='<tr><td colspan="6" class="text-center text-muted">Sin grados</td></tr>';
    $("#gradesTableBody").html(b);
  });
});
