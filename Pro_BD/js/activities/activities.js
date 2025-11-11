$(function(){
  requireAuth();
  $.get(API_BASE_URL+"/activities/get_all.php",d=>{
    let b="";
    if(d.success&&d.data.length){
      d.data.forEach(act=>{
        b+=`<tr>
          <td>${act.Name}</td><td>${dateToString(act.ScheduledDate)}</td><td>${act.GradeName||"-"}</td>
          <td>${act.Teacher||"-"}</td><td>${act.Category||"-"}</td><td>${act.Status}</td>
          <td><a class="btn btn-info btn-sm" href="#">Ver</a></td>
        </tr>`;
      });
    } else b='<tr><td colspan="7" class="text-center text-muted">Sin actividades</td></tr>';
    $("#activitiesTableBody").html(b);
  });
});
