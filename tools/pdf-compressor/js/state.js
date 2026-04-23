// ============================================================
// state.js — PDF Compressor (Grifo Tools)
// Responsabilidade: Estado mutavel da aplicacao
// Dependencias: nenhuma
// ============================================================

var AppState = {
  file:             null,
  originalSize:     0,
  compressedBytes:  null,
  status:           'idle',          // 'idle' | 'loaded' | 'compressing' | 'done'
  compressionLevel: 'equilibrado'    // 'leve' | 'equilibrado' | 'maximo'
};
