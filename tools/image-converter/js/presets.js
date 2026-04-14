// ============================================================
// presets.js — Image Converter (Grifo Tools)
// Responsabilidade: CRUD de presets no localStorage
// Dependências: config.js (PRESETS_KEY), DOM globals de main.js:
//               applyPresetSel, formatSel, qualityInput, jpgBg,
//               resizeToggle, maxW, maxH, concurrencyInp
// ============================================================

function loadPresets() {
  var raw  = localStorage.getItem(PRESETS_KEY);
  var list = {};
  try { list = raw ? JSON.parse(raw) : {}; } catch (_) { list = {}; }
  applyPresetSel.innerHTML =
    '<option value="">Aplicar preset…</option>' +
    Object.keys(list).map(function(k) {
      var safe = escapeHtml(k);
      return '<option value="' + safe + '">' + safe + '</option>';
    }).join('');
  return list;
}

function savePreset(name) {
  var list   = loadPresets();
  list[name] = {
    format: formatSel.value,
    q:      Number(qualityInput.value),
    jpgBg:  jpgBg.value,
    resize: resizeToggle.checked,
    mw:     Number(maxW.value),
    mh:     Number(maxH.value),
    cc:     Number(concurrencyInp.value)
  };
  localStorage.setItem(PRESETS_KEY, JSON.stringify(list));
  loadPresets();
}

function deletePreset(name) {
  var list = loadPresets();
  delete list[name];
  localStorage.setItem(PRESETS_KEY, JSON.stringify(list));
  loadPresets();
}
