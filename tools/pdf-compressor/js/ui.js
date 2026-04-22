// ============================================================
// ui.js — PDF Compressor (Grifo Tools)
// Responsabilidade: Manipulacao do DOM e feedback visual
// Dependencias: config.js, utils.js (formatFileSize)
// ============================================================

var UI = (function () {

  function el(id) { return document.getElementById(id); }

  var _toastTimer = null;

  function showToast(msg) {
    var t = el('toast');
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(8px)';
    }, TOAST_DURATION_MS);
  }

  function setProgress(pct) {
    el('progressBar').style.width = Math.min(pct, 100) + '%';
    el('progressLabel').textContent = Math.round(Math.min(pct, 100)) + '%';
  }

  // Exibe o estado "arquivo carregado, pronto para comprimir".
  function showLoaded(file) {
    el('dropzone').classList.add('hidden');
    el('fileInfo').classList.remove('hidden');
    el('fileName').textContent = file.name;
    el('originalSizeLabel').textContent = formatFileSize(file.size) + ' — tamanho original';

    el('progressSection').classList.add('hidden');
    el('resultSection').classList.add('hidden');

    el('btnCompress').style.display = '';
    el('btnDownload').style.display = 'none';
    el('btnReset').style.display    = 'none';
    el('actionsSection').classList.add('show');
  }

  // Exibe o estado "comprimindo" com barra de progresso.
  function showCompressing() {
    el('resultSection').classList.add('hidden');
    el('progressSection').classList.remove('hidden');
    el('actionsSection').classList.remove('show');
    setProgress(0);
  }

  // Exibe o resultado final da compressao.
  function showResult(originalSize, compressedSize) {
    el('progressSection').classList.add('hidden');
    el('resultSection').classList.remove('hidden');

    el('resultOriginal').textContent    = formatFileSize(originalSize);
    el('resultCompressed').textContent  = formatFileSize(compressedSize);

    var reduction = originalSize > 0
      ? (1 - compressedSize / originalSize) * 100
      : 0;

    if (reduction > 0) {
      el('reductionCard').className  = 'rounded-xl bg-green-50 border border-green-200 px-3 py-4';
      el('reductionLabel').className = 'text-xs text-green-600 mb-1';
      el('reductionLabel').textContent   = 'Redução';
      el('resultReduction').className    = 'text-base font-semibold text-green-700';
      el('resultReduction').textContent  = '-' + reduction.toFixed(1) + '%';
    } else {
      el('reductionCard').className  = 'rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-4';
      el('reductionLabel').className = 'text-xs text-neutral-400 mb-1';
      el('reductionLabel').textContent   = 'Redução';
      el('resultReduction').className    = 'text-base font-semibold text-neutral-500';
      el('resultReduction').textContent  = '0%';
    }

    el('btnCompress').style.display = 'none';
    el('btnDownload').style.display = '';
    el('btnReset').style.display    = '';
    el('actionsSection').classList.add('show');
  }

  // Restaura o estado inicial (idle).
  function reset() {
    el('dropzone').classList.remove('hidden');
    el('fileInfo').classList.add('hidden');
    el('progressSection').classList.add('hidden');
    el('resultSection').classList.add('hidden');
    el('actionsSection').classList.remove('show');
    el('btnCompress').style.display = '';
    el('btnDownload').style.display = 'none';
    el('btnReset').style.display    = 'none';
    el('fileInput').value           = '';
    setProgress(0);
  }

  function setDropzoneActive(active) {
    el('dropzone').classList.toggle('dragover', active);
  }

  return {
    el:               el,
    showToast:        showToast,
    setProgress:      setProgress,
    showLoaded:       showLoaded,
    showCompressing:  showCompressing,
    showResult:       showResult,
    reset:            reset,
    setDropzoneActive: setDropzoneActive
  };

})();
