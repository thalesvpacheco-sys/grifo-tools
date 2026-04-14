// ============================================================
// main.js — Image Converter (Grifo Tools)
// Responsabilidade: Seletores DOM globais, event listeners e inicialização
// Dependências: todos os outros arquivos JS (devem ser carregados antes)
// ============================================================

// ── Utilitário de seleção ────────────────────────────────────
var $ = function(s) { return document.querySelector(s); };

// ── Variáveis DOM globais ────────────────────────────────────
// (acessadas por ui.js, processor.js, presets.js, utils.js)
var fileInput       = $('#fileInput');
var dropzone        = $('#dropzone');
var fileList        = $('#fileList');
var queueInfo       = $('#queueInfo');
var totalBar        = $('#totalBar');
var totalText       = $('#totalText');
var summary         = $('#summary');
var statusLive      = $('#statusLive');

var formatSel       = $('#formatSel');
var qualityRange    = $('#quality');
var qualityInput    = $('#qualityInput');
var qualityHint     = $('#qualityHint');
var jpgBgWrap       = $('#jpgBgWrap');
var jpgBg           = $('#jpgBg');
var resizeToggle    = $('#resizeToggle');
var maxW            = $('#maxW');
var maxH            = $('#maxH');
var concurrencyInp  = $('#concurrency');
var savePresetBtn   = $('#savePreset');
var applyPresetSel  = $('#applyPreset');
var deletePresetBtn = $('#deletePreset');

// ── Objeto global de botões ──────────────────────────────────
var btns = {
  convert:  $('#btnConvert'),
  pause:    $('#btnPause'),
  resume:   $('#btnResume'),
  clear:    $('#btnClear'),
  zip:      $('#btnZip'),
  mConvert: $('#mConvert'),
  mPause:   $('#mPause'),
  mResume:  $('#mResume'),
  mZip:     $('#mZip')
};

// ── Event listeners: controles de formato e qualidade ────────
formatSel.addEventListener('change', applyFormatUI);

qualityRange.addEventListener('input', function() {
  qualityInput.value = qualityRange.value;
});
qualityInput.addEventListener('input', function() {
  var v = Math.max(1, Math.min(100, Number(qualityInput.value) || 85));
  qualityInput.value = v;
  qualityRange.value = v;
});

// ── Event listeners: dropzone e file input ───────────────────
dropzone.addEventListener('click', function() { fileInput.click(); });

dropzone.addEventListener('dragover', function(e) {
  e.preventDefault();
  dropzone.classList.add('border-brand-500');
});
dropzone.addEventListener('dragleave', function() {
  dropzone.classList.remove('border-brand-500');
});
dropzone.addEventListener('drop', function(e) {
  e.preventDefault();
  dropzone.classList.remove('border-brand-500');
  void addFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', function() {
  void addFiles(fileInput.files);
});

// ── Event listener: paste de clipboard ──────────────────────
window.addEventListener('paste', async function(e) {
  var items = (e.clipboardData && e.clipboardData.items)
    ? Array.from(e.clipboardData.items)
    : [];
  var imgs = items.filter(function(it) { return it.type && it.type.startsWith('image/'); });
  if (!imgs.length) return;

  var blobs = await Promise.all(imgs.map(function(it) { return it.getAsFile(); }));
  var files = blobs.map(function(b, i) {
    return new File(
      [b],
      'clipboard-' + Date.now() + '-' + i + '.' + (b.type.split('/')[1] || 'png'),
      { type: b.type }
    );
  });
  await addFiles(files);
  notify(files.length + ' imagem(ns) coladas do clipboard.');
});

// ── Event listeners: botões de ação ─────────────────────────
[btns.convert, btns.mConvert].forEach(function(b) { b.addEventListener('click', convertAll);  });
[btns.pause,   btns.mPause  ].forEach(function(b) { b.addEventListener('click', pause);       });
[btns.resume,  btns.mResume ].forEach(function(b) { b.addEventListener('click', resume);      });
btns.clear.addEventListener('click', clearQueue);
[btns.zip,     btns.mZip    ].forEach(function(b) { b.addEventListener('click', downloadZip); });

// ── Event listeners: presets ─────────────────────────────────
savePresetBtn.addEventListener('click', function() {
  var name = prompt('Nome do preset:');
  if (!name) return;
  savePreset(name);
  notify('Preset "' + name + '" salvo.');
});

applyPresetSel.addEventListener('change', function() {
  var name = applyPresetSel.value;
  if (!name) return;
  var list = loadPresets();
  var p    = list[name];
  if (!p) return;
  formatSel.value      = p.format || 'webp';
  qualityInput.value   = p.q  != null ? p.q  : 85;
  qualityRange.value   = p.q  != null ? p.q  : 85;
  jpgBg.value          = p.jpgBg || '#FFFFFF';
  resizeToggle.checked = !!p.resize;
  maxW.value           = p.mw;
  maxH.value           = p.mh;
  concurrencyInp.value = p.cc != null ? p.cc : 3;
  applyFormatUI();
  settings();
  notify('Preset "' + name + '" aplicado.');
});

deletePresetBtn.addEventListener('click', function() {
  var name = applyPresetSel.value;
  if (!name) { alert('Selecione um preset para excluir.'); return; }
  if (confirm('Excluir preset "' + name + '"?')) {
    deletePreset(name);
    notify('Preset excluído.');
  }
});

// ── Event listener: atalhos de teclado ──────────────────────
window.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) convertAll();
  if (e.key === 'Escape') pause();
});

// ── Inicialização ────────────────────────────────────────────
loadPresets();
applyFormatUI();
