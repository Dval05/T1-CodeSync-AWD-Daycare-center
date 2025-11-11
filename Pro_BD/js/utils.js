function showAlert(type, msg, sel="#alertMessage", auto=true) {
  const $a=$(sel);
  $a.removeClass().addClass("alert alert-"+type);
  $a.find('.alert-text').text(msg); $a.show();
  if(auto && type==="success") setTimeout(()=>$a.hide(),3000);
}
function dateToString(date) { return date ? (new Date(date)).toLocaleDateString("es-ES") : ""; }
function moneyFormat(n) { return n ? "$"+parseFloat(n).toFixed(2) : "$0.00"; }

