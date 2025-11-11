$(function(){
  requireAuth();
  $.get(API_BASE_URL+"/attendance/get_all.php",function(r){
    let b="";
    if(r.success&&r.data.length){
      r.data.forEach(a=>{
        b+=`<tr>
          <td>${a.StudentName}</td><td>${dateToString(a.Date)}</td>
          <td>${a.CheckInTime||"-"}</td><td>${a.CheckOutTime||"-"}</td>
          <td>${a.Status}</td><td>${a.Notes||""}</td>
          <td><a href="#" class="btn btn-info btn-sm">Ver</a></td>
        </tr>`;
      });
    } else b='<tr><td colspan="7" class="text-center text-muted">Sin registros</td></tr>';
    $("#attendanceTableBody").html(b);
  });
});
