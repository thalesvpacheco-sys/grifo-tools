// ============================================================
// utils.js — QR Code (Grifo Tools)
// Responsabilidade: Funcoes puras utilitarias (sem efeitos DOM)
// Dependencias: config.js
// ============================================================

/**
 * Calcula o tamanho de exibicao do preview
 * respeitando o tamanho real do container e o cap configurado.
 */
function getDisplaySize(previewEl) {
  var box = previewEl.getBoundingClientRect();
  var w = box.width || 340;
  return Math.max(QR_LIMITS.SIZE_MIN, Math.min(Math.floor(w), QR_LIMITS.DISPLAY_CAP));
}

/**
 * Clamp + parse seguro para inputs numericos.
 */
function clampInt(value, min, max, fallback) {
  var n = parseInt(value, 10);
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(n, max));
}

/**
 * Monta a URL compartilhavel com o estado atual encodado nos params.
 */
function buildShareUrl(state) {
  var base = location.href.split('?')[0];
  var u = new URL(base);
  var p = new URLSearchParams();
  p.set('u',  state.data);
  p.set('s',  state.size);
  p.set('m',  state.margin);
  p.set('e',  state.ecl);
  p.set('cd', state.colorDark);
  p.set('cl', state.colorLight);
  p.set('f',  state.format);
  p.set('d',  state.dots);
  u.search = p.toString();
  return u.toString();
}

/**
 * Le os params da URL e retorna objeto parcial de estado.
 * Retorna null se nao houver params relevantes.
 */
function parseShareUrl() {
  var p = new URLSearchParams(location.search);
  if (!p.has('u')) return null;
  return {
    data:       p.get('u') || QR_DEFAULTS.data,
    size:       clampInt(p.get('s'), QR_LIMITS.SIZE_MIN, QR_LIMITS.SIZE_MAX, QR_DEFAULTS.size),
    margin:     clampInt(p.get('m'), QR_LIMITS.MARGIN_MIN, QR_LIMITS.MARGIN_MAX, QR_DEFAULTS.margin),
    ecl:        ['L','M','Q','H'].indexOf(p.get('e')) !== -1 ? p.get('e') : QR_DEFAULTS.ecl,
    colorDark:  p.get('cd') || QR_DEFAULTS.colorDark,
    colorLight: p.get('cl') || QR_DEFAULTS.colorLight,
    format:     ['png','svg'].indexOf(p.get('f')) !== -1 ? p.get('f') : QR_DEFAULTS.format,
    dots:       ['square','rounded'].indexOf(p.get('d')) !== -1 ? p.get('d') : QR_DEFAULTS.dots
  };
}