// Sidebar responsive toggle

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar || !toggleBtn || !backdrop) return;

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.remove('hidden');
    document.body.classList.add('sidebar-open');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.add('hidden');
    document.body.classList.remove('sidebar-open');
  }
  toggleBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
  backdrop.addEventListener('click', closeSidebar);
  window.addEventListener('keyup', (e) => { if (e.key === 'Escape') closeSidebar(); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeSidebar(); });
});
