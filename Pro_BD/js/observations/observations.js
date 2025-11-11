$(function(){
  requireAuth();
  $.get(API_BASE_URL+"/observations/get_all.php",function(r){
    let b="";
    if(r.success&&r.data.length){
      r.data.forEach(o=>{
        b+=`<tr>
          <td>${o.StudentName}</td><td>${o.ObservationDate}</td>
          <td>${o.Category}</td><td>${o.Observation.slice(0,40)}</td>
          <td>${o.EmployeeName}</td>
          <td>${o.IsPrivate?"Sí":"No"}</td>
          <td><a class="btn btn-info btn-sm" href="observation-detail.html?id=${o.ObservationID}">Ver</a></td>
        </tr>`;
      });
    } else b='<tr><td colspan="7" class="text-center text-muted">Sin observaciones</td></tr>';
    $("#observationsTableBody").html(b);
  });
});
