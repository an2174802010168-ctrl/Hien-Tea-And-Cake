(() => {
  const setOpen = (btn, nav, open) => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  };

  const getNav = (btn) => document.getElementById(btn.getAttribute('aria-controls') || 'nav');

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.menu-toggle');
    if (!btn) return;

    const nav = getNav(btn);
    if (nav) setOpen(btn, nav, !nav.classList.contains('open'));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 760) return;

    document.querySelectorAll('.menu-toggle').forEach((btn) => {
      const nav = getNav(btn);
      if (nav) setOpen(btn, nav, false);
    });
  });
})();
