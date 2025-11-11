$(function(){
  requireAuth();
  const urlParams=new URLSearchParams(window.location.search);
  const studentId=urlParams.get('studentId');
  if(!studentId) window.location.href="students.html";
  $.get(API_BASE_URL+"/students/get_by_id.php",{id:studentId},d=>{
    const s=d.data;
    $("#studentPhoto").attr("src",s.ProfilePicture||'../img/undraw_profile.svg');
    $("#studentFullName").text(`${s.FirstName} ${s.LastName}`);
    $("#studentGrade").text(s.GradeName);
    $("#studentStatus").text(s.IsActive?"Activo":"Inactivo").attr("class",`badge badge-${s.IsActive?"success":"secondary"}`);
    $("#studentType").text(s.IsRecurrent?"Recurrente":"Ocasional").attr("class","badge badge-info");
    $("#studentAge").text(s.Age+" años");
    $("#studentGender").text(s.Gender);
    $("#firstName").text(s.FirstName); $("#lastName").text(s.LastName);
    $("#birthDate").text(s.BirthDate);
    $("#documentNumber").text(s.DocumentNumber||"-");
    $("#email").text(s.Email||"-");
    $("#phoneNumber").text(s.PhoneNumber||"-");
    $("#address").text(s.Address||"-");
    $("#enrollmentDate").text(s.EnrollmentDate||"-");
    // ... etc: carga tablas/tabs/tutores, pagos, asistencia, observaciones, actividades vía ajax a otros endpoints
  });
});
