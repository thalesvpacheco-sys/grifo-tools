// ============================================================
// utils.js — PDF Compressor (Grifo Tools)
// Responsabilidade: Logica pura — compressao e formatacao
// Dependencias: pdf-lib (global PDFLib), config.js
// ============================================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Carrega e reserializa o PDF com object streams comprimidos.
// Retorna Promise<Uint8Array>.
function compressPdf(arrayBuffer) {
  return PDFLib.PDFDocument.load(arrayBuffer).then(function (pdfDoc) {
    return pdfDoc.save({
      useObjectStreams:  true,
      objectsPerTick:   COMPRESS_OBJECTS_PER_TICK
    });
  });
}
