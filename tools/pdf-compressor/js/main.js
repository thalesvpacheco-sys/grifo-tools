// ============================================================
// main.js — PDF Compressor (Grifo Tools)
// Responsabilidade: Inicializacao e wire-up de eventos
// Dependencias: config.js, state.js, utils.js, ui.js
// ============================================================

(function () {

  function handleFile(file) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      UI.showToast('Apenas arquivos PDF são aceitos.');
      return;
    }

    AppState.file            = file;
    AppState.originalSize    = file.size;
    AppState.compressedBytes = null;
    AppState.status          = 'loaded';
    UI.showLoaded(file, AppState.compressionLevel);
  }

  function runCompression() {
    if (!AppState.file || AppState.status === 'compressing') return;

    AppState.status = 'compressing';
    UI.showCompressing();

    var reader = new FileReader();

    reader.onload = function (e) {
      var arrayBuffer = e.target.result;

      // setTimeout dá ao browser um frame para renderizar o spinner antes do WASM bloquear.
      setTimeout(function () {
        compressPdf(arrayBuffer, AppState.compressionLevel)
          .then(function (output) {
            AppState.compressedBytes = output;
            AppState.status          = 'done';
            UI.showResult(AppState.originalSize, output.byteLength);
          })
          .catch(function (err) {
            AppState.status = 'loaded';
            UI.showCompressionError(AppState.compressionLevel);
            UI.showToast('Erro ao comprimir: ' + (err && err.message ? err.message : 'falha desconhecida'));
          });
      }, 50);
    };

    reader.onerror = function () {
      AppState.status = 'loaded';
      UI.showCompressionError(AppState.compressionLevel);
      UI.showToast('Erro ao ler o arquivo.');
    };

    reader.readAsArrayBuffer(AppState.file);
  }

  function runDownload() {
    if (!AppState.compressedBytes) return;
    var blob = new Blob([AppState.compressedBytes], { type: 'application/pdf' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href     = url;
    a.download = EXPORTED_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.showToast('Download iniciado!');
  }

  function runReset() {
    AppState.file             = null;
    AppState.originalSize     = 0;
    AppState.compressedBytes  = null;
    AppState.status           = 'idle';
    AppState.compressionLevel = 'equilibrado';
    UI.reset();
  }

  // ── Seletor de nível de compressão ───────────────────────
  document.querySelectorAll('.level-card').forEach(function (btn) {
    btn.addEventListener('click', function () {
      AppState.compressionLevel = btn.dataset.level;
      UI.setLevelActive(btn.dataset.level);
    });
  });

  // ── Dropzone ──────────────────────────────────────────────
  var dropzone  = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');

  dropzone.addEventListener('click', function () { fileInput.click(); });

  dropzone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });

  dropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    UI.setDropzoneActive(true);
  });

  dropzone.addEventListener('dragleave', function (e) {
    if (!dropzone.contains(e.relatedTarget)) {
      UI.setDropzoneActive(false);
    }
  });

  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    UI.setDropzoneActive(false);
    var files = e.dataTransfer.files;
    if (files.length) handleFile(files[0]);
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
  });

  document.getElementById('btnRemove').addEventListener('click', function (e) {
    e.stopPropagation();
    runReset();
  });

  document.getElementById('btnCompress').addEventListener('click', runCompression);
  document.getElementById('btnDownload').addEventListener('click', runDownload);
  document.getElementById('btnReset').addEventListener('click', runReset);

})();
