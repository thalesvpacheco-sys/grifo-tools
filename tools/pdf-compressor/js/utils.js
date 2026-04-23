// ============================================================
// utils.js — PDF Compressor (Grifo Tools)
// Responsabilidade: Logica pura — compressao e formatacao
// Dependencias: config.js, window._initGhostscript (WASM)
// ============================================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Comprime o PDF usando Ghostscript WASM.
// Retorna Promise<Uint8Array>.
function compressPdf(arrayBuffer, level) {
  return new Promise(function (resolve, reject) {
    var initGs = window._initGhostscript;
    if (typeof initGs !== 'function') {
      reject(new Error('Ghostscript WASM não carregado. Recarregue a página.'));
      return;
    }

    var levelConfig = COMPRESSION_LEVELS[level] || COMPRESSION_LEVELS.equilibrado;

    initGs().then(function (gs) {
      try {
        gs.FS.writeFile('input.pdf', new Uint8Array(arrayBuffer));

        var args = [
          '-sDEVICE=pdfwrite',
          '-dCompatibilityLevel=1.4'
        ].concat(levelConfig.args).concat([
          '-dNOPAUSE',
          '-dQUIET',
          '-dBATCH',
          '-sOutputFile=output.pdf',
          'input.pdf'
        ]);

        gs.callMain(args);

        var output = gs.FS.readFile('output.pdf');
        resolve(output);
      } catch (err) {
        reject(err);
      }
    }).catch(reject);
  });
}
