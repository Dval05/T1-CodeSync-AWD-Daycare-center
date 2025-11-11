$(function(){
  requireAuth();
  $.get(API_BASE_URL+"/payments/student/get_all.php",function(r){
    let b="";
    if(r.success&&r.data.length){
      r.data.forEach(p=>{
        b+=`<tr>
          <td>${p.EntityName}</td><td>${p.PaymentDate}</td>
          <td>${p.ServiceType}</td><td>${moneyFormat(p.TotalAmount)}</td>
          <td>${p.PaymentMethod||"-"}</td>
          <td>${p.Status}</td>
          <td><a href="#" class="btn btn-info btn-sm">Ver</a></td>
        </tr>`;
      });
    } else b='<tr><td colspan="7" class="text-center text-muted">Sin pagos</td></tr>';
    $("#studentPaymentsTableBody").html(b);
  });
});
