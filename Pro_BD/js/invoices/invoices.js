$(function(){
  requireAuth();
  $.get(API_BASE_URL+"/invoices/get_all.php",function(r){
    let b="";
    if(r.success&&r.data.length){
      r.data.forEach(f=>{
        b+=`<tr>
          <td>${f.InvoiceNumber}</td>
          <td>${f.InvoiceType}</td>
          <td>${f.ReferenceID}</td>
          <td>${moneyFormat(f.TotalAmount)}</td>
          <td>${f.IssueDate}</td>
          <td>${f.Status}</td>
          <td><a href="invoice-detail.html?iid=${f.InvoiceID}" class="btn btn-info btn-sm">Ver</a></td>
        </tr>`;
      });
    } else b='<tr><td colspan="7" class="text-center text-muted">Sin facturas</td></tr>';
    $("#invoicesTableBody").html(b);
  });
});
