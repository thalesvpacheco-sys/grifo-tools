// ============================================================
// heic.js — Image Converter (Grifo Tools)
// Responsabilidade: Decodificação de arquivos HEIC em 3 camadas de fallback
//                   (native → heic2any → libheif)
// Dependências: utils.js (detectAlphaFromCanvas)
// ============================================================

async function tryDecodeHeicNative(file) {
  // Em alguns Macs, Chrome decodifica HEIC via OS.
  // No Windows, quase sempre falha.
  try {
    var bmp = await createImageBitmap(file);
    var c   = document.createElement('canvas');
    c.width = bmp.width; c.height = bmp.height;
    var ctx = c.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    bmp.close();
    var hadAlpha = await detectAlphaFromCanvas(c);
    return { canvas: c, width: c.width, height: c.height, hadAlpha: hadAlpha, via: 'native' };
  } catch (_) {
    return null;
  }
}

async function tryDecodeHeicHeic2any(file) {
  if (typeof window.heic2any !== 'function') return null;
  try {
    var blob = await window.heic2any({ blob: file, toType: 'image/png' });
    var img  = new Image();
    var url  = URL.createObjectURL(blob);
    await new Promise(function(res, rej) {
      img.onload  = function() { URL.revokeObjectURL(url); res(); };
      img.onerror = function() { URL.revokeObjectURL(url); rej(new Error('Falha ao carregar blob HEIC')); };
      img.src     = url;
    });

    var c   = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    img.src = '';

    var hadAlpha = await detectAlphaFromCanvas(c);
    return { canvas: c, width: c.width, height: c.height, hadAlpha: hadAlpha, via: 'heic2any' };
  } catch (e) {
    return { error: (e && e.message) ? e.message : String(e), via: 'heic2any' };
  }
}

async function getLibheifModule(timeoutMs) {
  timeoutMs = timeoutMs || 12000;
  var start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (window.libheif) break;
    await new Promise(function(r) { setTimeout(r, 50); });
  }
  if (!window.libheif) throw new Error('Decoder libheif não carregou (CDN bloqueado?).');

  var lh = window.libheif;

  // Alguns bundles expõem factory function (emscripten)
  if (typeof lh === 'function') {
    return await lh();
  }

  // Alguns expõem .ready
  if (lh.ready && typeof lh.ready.then === 'function') {
    await lh.ready;
  }

  return lh;
}

async function tryDecodeHeicLibheif(file) {
  try {
    var mod = await getLibheifModule();
    if (!mod || !mod.HeifDecoder) throw new Error('libheif carregou, mas HeifDecoder não existe.');

    var buf     = new Uint8Array(await file.arrayBuffer());
    var decoder = new mod.HeifDecoder();
    var images  = decoder.decode(buf);
    if (!images || !images.length) throw new Error('HEIC inválido ou não suportado (decode vazio).');

    var img    = images[0];
    var width  = img.get_width();
    var height = img.get_height();

    var c         = document.createElement('canvas');
    c.width       = width; c.height = height;
    var ctx       = c.getContext('2d');
    var imageData = ctx.createImageData(width, height);

    await new Promise(function(resolve, reject) {
      img.display(imageData, function(displayData) {
        if (!displayData) return reject(new Error('Falha ao renderizar HEIC (displayData vazio).'));
        resolve();
      });
    });

    ctx.putImageData(imageData, 0, 0);

    var hadAlpha = false;
    var data     = imageData.data;
    var step     = 4 * 32;
    for (var i = 3; i < data.length; i += step) {
      if (data[i] < 255) { hadAlpha = true; break; }
    }

    return { canvas: c, width: width, height: height, hadAlpha: hadAlpha, via: 'libheif' };
  } catch (e) {
    return { error: (e && e.message) ? e.message : String(e), via: 'libheif' };
  }
}

async function decodeHeicToCanvas(file) {
  // Camada 1: nativo (macOS/Safari)
  var n = await tryDecodeHeicNative(file);
  if (n) return n;

  // Camada 2: heic2any
  var h2 = await tryDecodeHeicHeic2any(file);
  if (h2 && !h2.error) return h2;

  // Camada 3: libheif direto
  var lh = await tryDecodeHeicLibheif(file);
  if (lh && !lh.error) return lh;

  // Tudo falhou — monta mensagem de erro útil
  var reasons = [];
  if (h2 && h2.error) reasons.push('heic2any: ' + h2.error);
  if (lh && lh.error) reasons.push('libheif: '  + lh.error);
  if (!reasons.length) reasons.push('Chrome não conseguiu decodificar HEIC.');
  throw new Error(reasons.join(' | '));
}
