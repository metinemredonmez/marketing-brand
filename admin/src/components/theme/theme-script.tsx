/**
 * <html> üzerine, React hydrate olmadan önce, localStorage'tan okuduğu
 * tema değerine göre `dark` class'ını ekler. Bu sayede sayfa açılışında
 * "flash of light theme" olmaz.
 *
 * Server Component — yalnızca <script> inject eder.
 */
export function ThemeScript() {
  const code = `
    (function() {
      try {
        var stored = localStorage.getItem('mr-admin-theme') || 'system';
        var isDark = stored === 'dark' ||
          (stored === 'system' &&
           window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) document.documentElement.classList.add('dark');
      } catch (e) {}
    })();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
