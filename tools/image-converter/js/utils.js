// ============================================================
// utils.js — Image Converter (Grifo Tools)
// Responsabilidade: Funções utilitárias puras (sem efeitos colaterais no DOM)
// Dependências: config.js (LIMITS), variável global `formatSel` de main.js
// ============================================================

function fmtBytes(b) {
  if (b === 0) return '0 B';
  var k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  var i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(1) + ' ' + s[i];
}

function toOutName(name) {
  var base = name.replace(/\.[^.]+$/, '');
  return base + '.' + formatSel.value; // formatSel global de main.js
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

function isHeicFile(file) {
  var mime = (file.type || '').toLowerCase();
  var name = (file.name || '').toLowerCase();
  return mime.includes('heic') || mime.includes('heif') ||
         name.endsWith('.heic') || name.endsWith('.heif');
}

function fileToDataURL(file) {
  return new Promise(function(res, rej) {
    var r = new FileReader();
    r.onload  = function() { res(r.result); };
    r.onerror = function() { rej(new Error('Falha ao ler arquivo')); };
    r.readAsDataURL(file);
  });
}

function dataURLToBlob(dataURL) {
  var parts = dataURL.split(',');
  var mime  = parts[0].match(/:(.*?);/)[1];
  var bstr  = atob(parts[1]);
  var n     = bstr.length;
  var u8    = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new Blob([u8], { type: mime });
}

function canvasToType(canvas, mime, quality) {
  return new Promise(function(res, rej) {
    if (canvas.toBlob) {
      canvas.toBlob(function(b) {
        if (!b) { rej(new Error('Falha ao exportar imagem')); return; }
        res(b);
      }, mime, quality);
    } else {
      try { res(dataURLToBlob(canvas.toDataURL(mime, quality))); }
      catch (e) { rej(new Error('Exportação não suportada')); }
    }
  });
}

async function detectAlphaFromCanvas(canvas) {
  var w = canvas.width, h = canvas.height;
  var probeW = 128;
  var ratio = Math.min(1, probeW / w);
  var pw = Math.max(1, Math.floor(w * ratio));
  var ph = Math.max(1, Math.floor(h * ratio));
  var c = document.createElement('canvas');
  c.width = pw; c.height = ph;
  var x = c.getContext('2d');
  x.drawImage(canvas, 0, 0, pw, ph);
  var data = x.getImageData(0, 0, pw, ph).data;
  var step = 4 * 16;
  for (var i = 3; i < data.length; i += step) {
    if (data[i] < 255) return true;
  }
  return false;
}
