(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const storageKey = 'preferred-theme';

  if (!toggle) {
    return;
  }

  const setButtonState = (theme) => {
    const isDark = theme === 'dark';
    toggle.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
    toggle.innerHTML = isDark
      ? '<i class="fas fa-sun" aria-hidden="true"></i><span>Modo claro</span>'
      : '<i class="fas fa-moon" aria-hidden="true"></i><span>Modo oscuro</span>';
  };

  const getInitialTheme = () => {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(storageKey, theme);
    setButtonState(theme);
  };

  applyTheme(getInitialTheme());

  toggle.addEventListener('click', () => {
    const activeTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(activeTheme === 'dark' ? 'light' : 'dark');
  });
})();
