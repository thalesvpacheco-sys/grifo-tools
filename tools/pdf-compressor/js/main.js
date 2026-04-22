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
    if (file.size > MAX_FILE_SIZE_BYTES) {
      UI.showToast('Arquivo muito grande. Máximo: 100 MB.');
      return;
    }

    AppState.file            = file;
    AppState.originalSize    = file.size;
    AppState.compressedBytes = null;
    AppState.status          = 'loaded';
    UI.showLoaded(file);
  }

  function runCompression() {
    if (!AppState.file || AppState.status === 'compressing') return;

    AppState.status = 'compressing';
    UI.showCompressing();

    var reader = new FileReader();

    reader.onload = function (e) {
      var arrayBuffer = e.target.result;

      // Progresso simulado: avança até 90% enquanto a Promise processa.
      var progress = 0;
      var interval = setInterval(function () {
        progress += Math.random() * 12 + 3;
        if (progress > 90) progress = 90;
        UI.setProgress(progress);
      }, 150);

      compressPdf(arrayBuffer)
        .then(function (bytes) {
          clearInterval(interval);
          UI.setProgress(100);
          setTimeout(function () {
            AppState.compressedBytes = bytes;
            AppState.status          = 'done';
            UI.showResult(AppState.originalSize, bytes.byteLength);
          }, 300);
        })
        .catch(function (err) {
          clearInterval(interval);
          AppState.status = 'loaded';
          UI.el('progressSection').classList.add('hidden');
          UI.el('btnCompress').style.display = '';
          UI.el('actionsSection').classList.add('show');
          var msg = err && err.message ? err.message : 'formato não suportado';
          UI.showToast('Erro ao comprimir: ' + msg);
        });
    };

    reader.onerror = function () {
      AppState.status = 'loaded';
      UI.el('progressSection').classList.add('hidden');
      UI.el('btnCompress').style.display = '';
      UI.el('actionsSection').classList.add('show');
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
    AppState.file            = null;
    AppState.originalSize    = 0;
    AppState.compressedBytes = null;
    AppState.status          = 'idle';
    UI.reset();
  }

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
