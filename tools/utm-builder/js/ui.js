// ============================================================
// ui.js — UTM Builder (Grifo Tools)
// Responsabilidade: Leitura e escrita no DOM. Zero logica de negocio.
// Dependencias: config.js, state.js
// ============================================================

var UI = (function () {
  var _toastTimer = null;

  // ── Selecao de elementos ──────────────────────────────────

  function el(id) {
    return document.getElementById(id);
  }

  // ── Toast ─────────────────────────────────────────────────

  function showToast(msg, type) {
    var toast = el('toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border';

    if (type === 'error') {
      toast.className += ' bg-red-50 border-red-200 text-red-700';
    } else {
      toast.className += ' bg-neutral-900 border-neutral-700 text-white';
    }

    toast.style.opacity = '1';
    toast.style.pointerEvents = 'auto';

    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.pointerEvents = 'none';
    }, TOAST_DURATION_MS);
  }

  // ── Preview de URL ────────────────────────────────────────

  function setPreview(text, isError, isPlaceholder) {
    var preview = el('preview');
    if (!preview) return;
    preview.textContent = text;
    if (isError) {
      preview.className = 'block w-full rounded-xl border border-red-200 bg-red-50 font-mono text-sm p-4 break-words overflow-y-auto min-h-16 max-h-48 text-red-600';
    } else if (isPlaceholder) {
      preview.className = 'block w-full rounded-xl border border-neutral-200 bg-neutral-50 font-mono text-sm p-4 break-words overflow-y-auto min-h-16 max-h-48 text-neutral-400';
    } else {
      preview.className = 'block w-full rounded-xl border border-neutral-200 bg-neutral-50 font-mono text-sm p-4 break-words overflow-y-auto min-h-16 max-h-48 text-neutral-800';
    }
  }

  // ── Leitura do formulario para o State ───────────────────

  function readFormIntoState() {
    UTM_FIELDS.forEach(function (field) {
      State.setField(field.id, el(field.id) ? el(field.id).value : '');
    });
    State.setOption('lowercase',    el('optLower').checked);
    State.setOption('keepExisting', el('optKeepExisting').checked);
    State.setOption('encode',       el('optEncode').checked);
  }

  // ── Reset do formulario ───────────────────────────────────

  function resetForm() {
    UTM_FIELDS.forEach(function (field) {
      if (el(field.id)) el(field.id).value = '';
    });
    el('optLower').checked        = UTM_OPTIONS_DEFAULTS.lowercase;
    el('optKeepExisting').checked = UTM_OPTIONS_DEFAULTS.keepExisting;
    el('optEncode').checked       = UTM_OPTIONS_DEFAULTS.encode;
    setPreview('Preencha os campos para gerar a URL.', false, true);
  }

  // ── Botoes de acao pos-geracao ────────────────────────────

  function setActionsEnabled(enabled) {
    var btnCopy = el('btnCopy');
    var btnOpen = el('btnOpen');
    if (btnCopy) btnCopy.disabled = !enabled;
    if (btnOpen) btnOpen.disabled = !enabled;
  }

  return {
    el:               el,
    showToast:        showToast,
    setPreview:       setPreview,
    readFormIntoState: readFormIntoState,
    resetForm:        resetForm,
    setActionsEnabled: setActionsEnabled
  };
})();