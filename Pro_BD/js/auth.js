function getToken() { return localStorage.getItem(TOKEN_KEY); }
function isLoggedIn() { return !!getToken(); }
function requireAuth() { if(!isLoggedIn()) window.location.href="login.html"; }
function logout() {
  localStorage.clear();
  window.location.href="login.html";
}
$(document).on('click', '#logoutBtn', logout);
