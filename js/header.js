// ============================================================
// header.js — Grifo Tools
// Responsabilidade: Header compartilhado — injecao de HTML,
//   dark mode e logica de tema (toggle + persistencia).
// Carregado sincronamente logo apos <header id="site-header">
// no <body>, antes do restante do conteudo ser parseado.
// Dependencias: nenhuma (usa Tailwind CDN ja carregado na pagina)
// ============================================================

(function () {

  var headerEl = document.getElementById('site-header');
  if (!headerEl) return;

  var toolName = headerEl.getAttribute('data-tool') || '';
  var root     = headerEl.getAttribute('data-root') || './';
  var isHub    = (toolName === '');

  // ── 1. CSS do header ───────────────────────────────────────
  // Gerenciado inteiramente aqui para funcionar em qualquer pagina
  // sem depender do tailwind.config local nem do styles.css da ferramenta.

  var css = [
    /* Posicionamento e aparencia base */
    '#site-header {',
    '  position: sticky; top: 0; z-index: 50;',
    '  background-color: rgba(255,255,255,0.9);',
    '  border-bottom: 1px solid #e5e7eb;',
    '  transition: background-color 0.3s ease, border-color 0.3s ease;',
    '}',
    '@supports (backdrop-filter: blur(8px)) {',
    '  #site-header {',
    '    backdrop-filter: blur(8px);',
    '    -webkit-backdrop-filter: blur(8px);',
    '    background-color: rgba(255,255,255,0.7);',
    '  }',
    '}',

    /* Dark mode do header */
    'html.dark #site-header {',
    '  background-color: rgba(15,15,15,0.9);',
    '  border-color: #2a2a2a;',
    '}',
    '@supports (backdrop-filter: blur(8px)) {',
    '  html.dark #site-header {',
    '    background-color: rgba(15,15,15,0.7);',
    '  }',
    '}',

    /* Logo: visibilidade por tema */
    '#header-logo-dark { display: none; }',
    'html.dark #header-logo-light { display: none; }',
    'html.dark #header-logo-dark  { display: block; }',

    /* Fallback de texto da logo */
    '#header-logo-fallback {',
    '  display: none; font-weight: 600; font-size: 1.125rem; color: #641F18;',
    '}',
    'html.dark #header-logo-fallback { color: #D47A72; }',

    /* Seta de voltar */
    '#header-back {',
    '  color: #a3a3a3; text-decoration: none;',
    '  flex-shrink: 0; display: flex; align-items: center;',
    '  transition: color 0.15s ease;',
    '}',
    '#header-back:hover { color: #802B22; }',
    '#header-back:focus { outline: 2px solid #802B22; outline-offset: 2px; }',
    'html.dark #header-back:hover { color: #BA4F46; }',

    /* Nome da ferramenta */
    '#header-tool-name {',
    '  font-size: 0.875rem; font-weight: 500; color: #525252;',
    '}',
    'html.dark #header-tool-name { color: #a0a0a0; }',

    /* Botoes de tema: completamente flat, sem borda nem fundo */
    '#btn-light, #btn-dark {',
    '  background: none; border: none; cursor: pointer; padding: 0;',
    '  display: flex; align-items: center; justify-content: center;',
    '  width: 2rem; height: 2rem; border-radius: 0.5rem;',
    '  color: #1a1a1a;',
    '  transition: opacity 0.2s ease;',
    '}',
    'html.dark #btn-light,',
    'html.dark #btn-dark { color: #f5f5f5; }',

    /* Sem outline de foco no clique — mantido para teclado via :focus-visible */
    '#btn-light:focus, #btn-dark:focus { outline: none; }',
    '#btn-light:focus-visible, #btn-dark:focus-visible {',
    '  outline: 2px solid #802B22; outline-offset: 2px;',
    '}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.id = 'grifo-header-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── 2. SVGs inline ─────────────────────────────────────────

  var svgSun = '<svg style="width:1rem;height:1rem;display:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>';

  var svgMoon = '<svg style="width:1rem;height:1rem;display:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>';

  var svgBack = '<svg style="width:1rem;height:1rem;display:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>';

  // ── 3. HTML do header ─────────────────────────────────────
  // Layout via inline styles para garantir renderizacao correta
  // antes do Tailwind CDN processar as classes injetadas.

  var backHTML = isHub ? '' : [
    '<a id="header-back" href="' + root + 'index.html" aria-label="Voltar ao hub">',
    svgBack,
    '</a>'
  ].join('');

  var toolHTML = toolName
    ? '<span id="header-tool-name">' + toolName + '</span>'
    : '';

  /* onerror: exibe fallback de texto se a imagem nao carregar */
  var onErrLight = "this.style.display='none';document.getElementById('header-logo-fallback').style.display='inline'";
  var onErrDark  = "this.style.display='none';document.getElementById('header-logo-fallback').style.display='inline'";

  headerEl.innerHTML = [
    '<div style="max-width:64rem;margin:0 auto;padding:0 1rem;height:3.5rem;display:flex;align-items:center;gap:0.75rem">',

    backHTML,

    '  <a href="https://grifo.agency" target="_blank" rel="noopener"',
    '     aria-label="Visitar site da Grifo"',
    '     style="display:flex;align-items:center;flex-shrink:0;text-decoration:none">',
    '    <img id="header-logo-light"',
    '         src="' + root + 'assets/logo.png" alt="Grifo"',
    '         style="height:1.75rem;width:auto"',
    '         onerror="' + onErrLight + '" />',
    '    <img id="header-logo-dark"',
    '         src="' + root + 'assets/logo-white.png" alt="Grifo"',
    '         style="height:1.75rem;width:auto"',
    '         onerror="' + onErrDark + '" />',
    '    <span id="header-logo-fallback">Grifo</span>',
    '  </a>',

    '  <div style="flex:1"></div>',

    toolHTML,

    '  <div role="group" aria-label="Selecionar tema"',
    '       style="display:flex;align-items:center;gap:0.125rem">',
    '    <button id="btn-light" type="button" aria-label="Ativar tema claro">',
    svgSun,
    '    </button>',
    '    <button id="btn-dark" type="button" aria-label="Ativar tema escuro">',
    svgMoon,
    '    </button>',
    '  </div>',

    '</div>'
  ].join('\n');

  // ── 4. Logica de tema ─────────────────────────────────────

  function applyTheme(isDark) {
    document.documentElement.classList.toggle('dark', isDark);
    var btnLight = document.getElementById('btn-light');
    var btnDark  = document.getElementById('btn-dark');
    /* Ativo: opacidade 1 | Inativo: 0.25 */
    if (btnLight) btnLight.style.opacity = isDark ? '0.25' : '1';
    if (btnDark)  btnDark.style.opacity  = isDark ? '1'   : '0.25';
  }

  /* Sincroniza botoes com o estado atual
     (dark pode ja estar ativa pelo anti-flash script do <head>) */
  applyTheme(document.documentElement.classList.contains('dark'));

  var btnLight = document.getElementById('btn-light');
  var btnDark  = document.getElementById('btn-dark');

  if (btnLight) {
    btnLight.addEventListener('click', function () {
      localStorage.setItem('grifo_theme', 'light');
      applyTheme(false);
    });
  }

  if (btnDark) {
    btnDark.addEventListener('click', function () {
      localStorage.setItem('grifo_theme', 'dark');
      applyTheme(true);
    });
  }

})();