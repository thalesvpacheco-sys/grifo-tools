// ============================================================
// state.js — Image Converter (Grifo Tools)
// Responsabilidade: Objeto de estado global mutável da aplicação
// Dependências: nenhuma
// ============================================================

var state = {
  items:       [],
  nextId:      1,
  running:     0,
  paused:      false,
  concurrency: 3
};
