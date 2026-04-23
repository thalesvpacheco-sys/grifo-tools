// ============================================================
// config.js — PDF Compressor (Grifo Tools)
// Responsabilidade: Constantes da aplicacao
// Dependencias: nenhuma
// ============================================================

var ACCEPTED_TYPES    = ['application/pdf'];
var EXPORTED_FILENAME = 'comprimido.pdf';
var TOAST_DURATION_MS = 3000;

var COMPRESSION_LEVELS = {
  leve: {
    label:       'Leve',
    description: 'Mínima perda de qualidade',
    args:        ['-dPDFSETTINGS=/printer']
  },
  equilibrado: {
    label:       'Equilibrado',
    description: 'Recomendado',
    args:        ['-dPDFSETTINGS=/ebook', '-dDownsampleColorImages=true', '-dColorImageResolution=150']
  },
  maximo: {
    label:       'Máximo',
    description: 'Maior redução',
    args:        ['-dPDFSETTINGS=/screen']
  }
};
