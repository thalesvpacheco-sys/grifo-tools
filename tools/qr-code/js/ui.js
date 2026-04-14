// ============================================================
// ui.js — QR Code (Grifo Tools)
// Responsabilidade: Leitura e escrita no DOM. Zero logica de negocio.
// Dependencias: config.js, state.js
// ============================================================

var UI = (function () {

  function el(id) {
    return document.getElementById(id);
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  // ── Status ────────────────────────────────────────────────

  function setStatus(msg) {
    var s = el('status');
    if (s) s.textContent = msg;
  }

  // ── Leitura do formulario para o State ───────────────────

  function readFormIntoState(previewEl) {
    var dataVal = el('data').value.trim();
    if (!dataVal) return false;

    State.setMany({
      data:       dataVal,
      size:       clampInt(el('size').value,   QR_LIMITS.SIZE_MIN,   QR_LIMITS.SIZE_MAX,   QR_DEFAULTS.size),
      margin:     clampInt(el('margin').value, QR_LIMITS.MARGIN_MIN, QR_LIMITS.MARGIN_MAX, QR_DEFAULTS.margin),
      ecl:        el('ecl').value,
      colorDark:  el('colorDark').value,
      colorLight: el('colorLight').value,
      format:     el('format').value,
      dots:       (qs('input[name="dots"]:checked') || {}).value || QR_DEFAULTS.dots
    });

    return true;
  }

  // ── Preenchimento do formulario a partir do State ────────

  function populateForm(state) {
    el('data').value        = state.data;
    el('size').value        = state.size;
    el('margin').value      = state.margin;
    el('ecl').value         = state.ecl;
    el('colorDark').value   = state.colorDark;
    el('colorLight').value  = state.colorLight;
    el('format').value      = state.format;
    var dotsRadio = qs('input[name="dots"][value="' + state.dots + '"]');
    if (dotsRadio) dotsRadio.checked = true;
  }

  return {
    el:               el,
    qs:               qs,
    setStatus:        setStatus,
    readFormIntoState: readFormIntoState,
    populateForm:     populateForm
  };
})();