// ============================================================
// config.js — QR Code (Grifo Tools)
// Responsabilidade: Constantes globais e valores padrao
// Dependencias: nenhuma
// ============================================================

var QR_DEFAULTS = {
  data:       'https://grifo.agency/',
  size:       320,
  margin:     4,
  ecl:        'M',
  colorDark:  '#0b0b0b',
  colorLight: '#ffffff',
  format:     'png',
  dots:       'square'
};

// Limites de validacao
var QR_LIMITS = {
  SIZE_MIN:   120,
  SIZE_MAX:   4096,
  MARGIN_MIN: 0,
  MARGIN_MAX: 256,
  DISPLAY_CAP: 520  // tamanho maximo de exibicao no preview (px)
};

// Nome base do arquivo exportado
var QR_EXPORT_NAME = 'grifo-qr';