// ============================================================
// utils.js — PDF Compressor (Grifo Tools)
// Responsabilidade: Logica pura — compressao e formatacao
// Dependencias: config.js
// ============================================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function _loadScript(src) {
  return new Promise(function (resolve, reject) {
    if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = function () { reject(new Error('Falha ao carregar: ' + src)); };
    document.head.appendChild(s);
  });
}

// ── Primary: Ghostscript via ps-wasm (ochachacha) ──────────────────────────

function _compressPsWasm(arrayBuffer, level) {
  return new Promise(function (resolve, reject) {
    var levelConfig = COMPRESSION_LEVELS[level] || COMPRESSION_LEVELS.equilibrado;

    if (!window._psWasmModule) {
      window.Module = {
        noInitialRun: true,
        print:        function () {},
        printErr:     function () {},
        onRuntimeInitialized: function () {
          window._psWasmModule = window.Module;
        }
      };
    }

    _loadScript('https://cdn.jsdelivr.net/gh/ochachacha/ps-wasm@master/gs.js')
      .then(function () {
        return new Promise(function (res, rej) {
          var attempts = 0;
          var timer = setInterval(function () {
            if (window._psWasmModule && window._psWasmModule.FS) {
              clearInterval(timer);
              res(window._psWasmModule);
            } else if (++attempts > 150) {
              clearInterval(timer);
              rej(new Error('ps-wasm: timeout aguardando módulo'));
            }
          }, 100);
        });
      })
      .then(function (M) {
        M.FS.writeFile('/input.pdf', new Uint8Array(arrayBuffer));

        var args = ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4']
          .concat(levelConfig.args)
          .concat(['-dNOPAUSE', '-dQUIET', '-dBATCH', '-sOutputFile=/output.pdf', '/input.pdf']);

        M.callMain(args);

        var output = M.FS.readFile('/output.pdf');
        if (!output || output.byteLength < 50) throw new Error('ps-wasm: output inválido');
        resolve(output);
      })
      .catch(reject);
  });
}

// ── Fallback: PDF.js render por canvas + pdf-lib rebuild ───────────────────

var _PDFJS_SRC    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
var _PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
var _PDFLIB_SRC   = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';

function _compressCanvas(arrayBuffer, level) {
  var levelConfig = COMPRESSION_LEVELS[level] || COMPRESSION_LEVELS.equilibrado;
  var scale       = levelConfig.canvasScale   || 1.0;
  var quality     = levelConfig.canvasQuality || 0.7;

  return Promise.all([
    _loadScript(_PDFJS_SRC).then(function () {
      if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = _PDFJS_WORKER;
    }),
    _loadScript(_PDFLIB_SRC)
  ]).then(function () {
    var pdfjsLib = window.pdfjsLib;
    var PDFLib   = window.PDFLib;

    if (!pdfjsLib) throw new Error('PDF.js indisponível');
    if (!PDFLib)   throw new Error('pdf-lib indisponível');

    return pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      .then(function (srcDoc) {
        var pageNums = [];
        for (var i = 1; i <= srcDoc.numPages; i++) pageNums.push(i);

        return PDFLib.PDFDocument.create().then(function (newPdf) {
          // Pages processadas sequencialmente para não explodir memória
          return pageNums.reduce(function (chain, n) {
            return chain.then(function () {
              return srcDoc.getPage(n).then(function (page) {
                var vp     = page.getViewport({ scale: scale });
                var canvas = document.createElement('canvas');
                canvas.width  = Math.round(vp.width);
                canvas.height = Math.round(vp.height);

                return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
                  .then(function () {
                    return new Promise(function (res) {
                      canvas.toBlob(function (blob) { res(blob); }, 'image/jpeg', quality);
                    });
                  })
                  .then(function (blob) { return blob.arrayBuffer(); })
                  .then(function (buf) {
                    return newPdf.embedJpg(new Uint8Array(buf)).then(function (img) {
                      var p = newPdf.addPage([canvas.width, canvas.height]);
                      p.drawImage(img, { x: 0, y: 0, width: canvas.width, height: canvas.height });
                    });
                  });
              });
            });
          }, Promise.resolve())
          .then(function () {
            return newPdf.save({ useObjectStreams: true });
          });
        });
      });
  });
}

// ── API pública ────────────────────────────────────────────────────────────

function compressPdf(arrayBuffer, level) {
  return _compressPsWasm(arrayBuffer, level)
    .catch(function (err) {
      console.warn('Ghostscript WASM falhou, usando fallback canvas:', err.message);
      return _compressCanvas(arrayBuffer, level);
    });
}
