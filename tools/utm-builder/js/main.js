// ============================================================
// main.js — UTM Builder (Grifo Tools)
// Responsabilidade: Inicializacao e wire-up de eventos
// Dependencias: config.js, state.js, utils.js, ui.js
// ============================================================

(function () {

  // ── Gerar URL ─────────────────────────────────────────────

  function handleBuild() {
    UI.readFormIntoState();
    var result = buildUtmUrl(State.get());

    if (!result.ok) {
      if (result.error) {
        UI.setPreview(result.error, true);
        UI.showToast(result.error, 'error');
      } else {
        UI.setPreview('Preencha os campos para gerar a URL.', false, true);
      }
      State.setBuiltUrl('');
      UI.setActionsEnabled(false);
      return;
    }

    State.setBuiltUrl(result.url);
    UI.setPreview(result.url, false);
    UI.setActionsEnabled(true);
  }

  // ── Copiar URL ────────────────────────────────────────────

  function handleCopy() {
    var url = State.get().builtUrl;
    if (!url) { UI.showToast('Gere uma URL primeiro.', 'error'); return; }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(function () { UI.showToast('URL copiada!'); })
        .catch(function () { fallbackCopy(url); });
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      UI.showToast('URL copiada!');
    } catch (e) {
      UI.showToast('Falha ao copiar.', 'error');
    }
    document.body.removeChild(ta);
  }

  // ── Abrir em nova aba ─────────────────────────────────────

  function handleOpen() {
    var url = State.get().builtUrl;
    if (!url) { UI.showToast('Gere uma URL primeiro.', 'error'); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // ── Reset ─────────────────────────────────────────────────

  function handleReset() {
    State.reset();
    UI.resetForm();
    UI.setActionsEnabled(false);
  }

  // ── Wire-up de eventos ────────────────────────────────────

  function init() {
    var form = document.getElementById('utmForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleBuild();
      });
    }

    // Atualizacao em tempo real enquanto digita
    UTM_FIELDS.forEach(function (field) {
      var input = UI.el(field.id);
      if (input) {
        input.addEventListener('input', handleBuild);
        input.addEventListener('change', handleBuild);
      }
    });

    ['optLower', 'optKeepExisting', 'optEncode'].forEach(function (id) {
      var el = UI.el(id);
      if (el) el.addEventListener('change', handleBuild);
    });

    var btnReset = UI.el('btnReset');
    if (btnReset) btnReset.addEventListener('click', handleReset);

    var btnCopy = UI.el('btnCopy');
    if (btnCopy) btnCopy.addEventListener('click', handleCopy);

    var btnOpen = UI.el('btnOpen');
    if (btnOpen) btnOpen.addEventListener('click', handleOpen);

    // Estado inicial dos botoes
    UI.setActionsEnabled(false);
  }

  document.addEventListener('DOMContentLoaded', init);

})();