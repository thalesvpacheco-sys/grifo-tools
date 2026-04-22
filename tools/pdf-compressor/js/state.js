// ============================================================
// state.js — PDF Compressor (Grifo Tools)
// Responsabilidade: Estado mutavel da aplicacao
// Dependencias: nenhuma
// ============================================================

var AppState = {
  file:            null,          // File object selecionado
  originalSize:    0,             // bytes do arquivo original
  compressedBytes: null,          // Uint8Array resultado | null
  status:          'idle'         // 'idle' | 'loaded' | 'compressing' | 'done'
};
