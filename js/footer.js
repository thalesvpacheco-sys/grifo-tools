// ============================================================
// footer.js — Grifo Tools
// Responsabilidade: Footer compartilhado — injecao de HTML e
//   estilos de dark mode. Inspirado no site grifo.agency.
// Carregado sincronamente logo apos <footer id="site-footer">
// Dependencias: nenhuma
// ============================================================

(function () {

  var footerEl = document.getElementById('site-footer');
  if (!footerEl) return;

  // Herda o root do header (evita duplicar atributo nos HTMLs)
  var headerEl = document.getElementById('site-header');
  var root = (headerEl && headerEl.getAttribute('data-root')) || './';

  // ── 1. CSS do footer ──────────────────────────────────────

  var css = [
    '#site-footer {',
    '  background-color: #ffffff;',
    '  border-top: 1px solid #e5e7eb;',
    '  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;',
    '}',
    'html.dark #site-footer {',
    '  background-color: #0f0f0f;',
    '  border-color: #2a2a2a;',
    '}',

    /* Logo footer */
    '#footer-logo-dark { display: none; }',
    'html.dark #footer-logo-light { display: none; }',
    'html.dark #footer-logo-dark  { display: block; }',
    '#footer-logo-fallback {',
    '  display: none; font-weight: 700; font-size: 1.125rem; color: #641F18;',
    '}',
    'html.dark #footer-logo-fallback { color: #D47A72; }',

    /* Tagline */
    '#footer-tagline {',
    '  margin-top: 0.5rem;',
    '  font-size: 0.8125rem;',
    '  line-height: 1.5;',
    '  color: #737373;',
    '  max-width: 18rem;',
    '}',
    'html.dark #footer-tagline { color: #a0a0a0; }',

    /* Titulo dos links */
    '#footer-links-title {',
    '  font-size: 0.75rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.06em;',
    '  text-transform: uppercase;',
    '  color: #404040;',
    '  margin-bottom: 0.75rem;',
    '}',
    'html.dark #footer-links-title { color: #a0a0a0; }',

    /* Links de navegacao */
    '.footer-link {',
    '  display: block;',
    '  font-size: 0.8125rem;',
    '  color: #525252;',
    '  text-decoration: none;',
    '  padding: 0.2rem 0;',
    '  transition: color 0.15s ease;',
    '}',
    '.footer-link:hover { color: #802B22; }',
    '.footer-link:focus { outline: 2px solid #802B22; outline-offset: 2px; }',
    'html.dark .footer-link { color: #a0a0a0; }',
    'html.dark .footer-link:hover { color: #D47A72; }',

    /* Barra inferior */
    '#footer-bottom {',
    '  border-top: 1px solid #f5f5f5;',
    '  padding: 1rem;',
    '  display: flex;',
    '  flex-wrap: wrap;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  gap: 0.5rem;',
    '  font-size: 0.6875rem;',
    '  color: #a3a3a3;',
    '}',
    'html.dark #footer-bottom { border-color: #1f1f1f; color: #737373; }'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.id = 'grifo-footer-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── 2. HTML do footer ────────────────────────────────────

  var onErrLight = "this.style.display='none';document.getElementById('footer-logo-fallback').style.display='inline'";
  var onErrDark  = "this.style.display='none';document.getElementById('footer-logo-fallback').style.display='inline'";

  var links = [
    { label: 'Home',       href: 'https://grifo.agency' },
    { label: 'Portfolio',  href: 'https://grifo.agency/portfolio' },
    { label: 'Quem Somos', href: 'https://grifo.agency/quem-somos' },
    { label: 'Servicos',   href: 'https://grifo.agency/servicos' },
    { label: 'Contato',    href: 'mailto:contato@grifopropaganda.com.br' }
  ];

  var linksHTML = links.map(function (l) {
    return '<a href="' + l.href + '" class="footer-link"' +
      (l.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '') +
      '>' + l.label + '</a>';
  }).join('');

  footerEl.innerHTML = [
    /* Topo: logo + links */
    '<div style="max-width:64rem;margin:0 auto;padding:2.5rem 1rem 2rem">',
    '  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:2.5rem">',

    /* Coluna esquerda */
    '    <div>',
    '      <a href="https://grifo.agency" target="_blank" rel="noopener"',
    '         style="display:inline-flex;align-items:center;text-decoration:none">',
    '        <img id="footer-logo-light" src="' + root + 'assets/logo.png" alt="Grifo"',
    '             style="height:1.5rem;width:auto"',
    '             onerror="' + onErrLight + '" />',
    '        <img id="footer-logo-dark" src="' + root + 'assets/logo-white.png" alt="Grifo"',
    '             style="height:1.5rem;width:auto"',
    '             onerror="' + onErrDark + '" />',
    '        <span id="footer-logo-fallback">Grifo</span>',
    '      </a>',
    '      <p id="footer-tagline">Ferramentas internas da Grifo Agency.</p>',
    '    </div>',

    /* Coluna direita */
    '    <div>',
    '      <p id="footer-links-title">Grifo Agency</p>',
    '      <nav>' + linksHTML + '</nav>',
    '    </div>',

    '  </div>',
    '</div>',

    /* Barra inferior */
    '<div id="footer-bottom">',
    '  <span>\u00a92026 Grifo Propaganda. Todos os direitos reservados.</span>',
    '  <span>Nenhum dado \u00e9 enviado a servidores.</span>',
    '</div>'
  ].join('\n');

})();