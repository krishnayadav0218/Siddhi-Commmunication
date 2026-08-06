import { Html, Head, Main, NextScript } from 'next/document';

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = window.localStorage.getItem('siddhi_theme');
    var theme = saved || 'pulse';
    if (theme !== 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch (e) {}
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Runs before React hydrates so the correct theme's colors are
            already applied on first paint — no flash of the default theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
