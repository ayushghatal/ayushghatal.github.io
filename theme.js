
function applyTheme(theme) {
  const themeName = theme.trim().toLowerCase().replace(/\s+/g, '-');
  const themeLink = document.getElementById('theme-style');
  if (themeLink) {
    themeLink.href = `themes/${themeName}.css`;
  } else {
    const newThemeLink = document.createElement('link');
    newThemeLink.id = 'theme-style';
    newThemeLink.rel = 'stylesheet';
    newThemeLink.href = `themes/${themeName}.css`;
    document.head.appendChild(newThemeLink);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(config.theme || 'light');
});

