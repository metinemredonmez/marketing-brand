/**
 * Hydration öncesi <html> class'ını ayarlar — FOUC önler.
 */
export function ThemeScript() {
  const code = `
    (function() {
      try {
        var stored = localStorage.getItem('mr-web-theme') || 'system';
        var isDark = stored === 'dark' ||
          (stored === 'system' &&
           window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) document.documentElement.classList.add('dark');
      } catch (e) {}
    })();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
