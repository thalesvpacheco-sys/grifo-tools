// ============================================================
// processor.js — Image Converter (Grifo Tools)
// Responsabilidade: Pipeline de conversão de imagens, fila com concorrência,
//                   controles de pause/resume/clear e geração de ZIP
// Dependências: config.js, state.js, utils.js, heic.js, ui.js,
//               DOM globals de main.js: formatSel, qualityInput, resizeToggle,
//               maxW, maxH, concurrencyInp, jpgBg, totalText, fileList
// ============================================================

function settings() {
  var q       = Math.max(1, Math.min(100, Number(qualityInput.value) || 85));
  var quality = Math.max(0.01, Math.min(1, q / 100));
  var resize  = !!resizeToggle.checked;
  var mw      = Math.max(1, Number(maxW.value) || 1920);
  var mh      = Math.max(1, Number(maxH.value) || 1080);
  var cc      = Math.max(1, Math.min(8, Number(concurrencyInp.value) || 3));
  state.concurrency = cc;
  return { format: formatSel.value, quality: quality, resize: resize, mw: mw, mh: mh, jpgBg: jpgBg.value };
}

async function processItem(item) {
  var cfg        = settings();
  var format     = cfg.format;
  var quality    = cfg.quality;
  var resize     = cfg.resize;
  var mw         = cfg.mw;
  var mh         = cfg.mh;
  var jpgBgColor = cfg.jpgBg;

  function update(pct, stage) {
    item.progress = pct;
    item.stage    = stage;
    updateItem(item);
    updateSummary();
  }

  try {
    item.status   = 'Processando';
    item.errorMsg = '';
    update(5, 'Preparando…');
    await new Promise(function(r) { requestAnimationFrame(r); });

    var srcW         = 0, srcH = 0;
    var sourceCanvas = null;
    var imgEl        = null;

    update(20, item.kind === 'heic' ? 'Decodificando HEIC…' : 'Carregando imagem…');

    if (item.kind === 'heic') {
      var decoded  = await decodeHeicToCanvas(item.file);
      sourceCanvas = decoded.canvas;
      srcW         = decoded.width;
      srcH         = decoded.height;
      item.hadAlpha = !!decoded.hadAlpha;
    } else {
      imgEl = new Image();
      var objURL = URL.createObjectURL(item.file);
      await new Promise(function(res, rej) {
        imgEl.onload  = function() { URL.revokeObjectURL(objURL); res(); };
        imgEl.onerror = function() { URL.revokeObjectURL(objURL); rej(new Error('Falha ao decodificar imagem')); };
        imgEl.src     = objURL;
      });
      srcW = imgEl.naturalWidth;
      srcH = imgEl.naturalHeight;
      item.hadAlpha = false; // detectado após desenhar no canvas
    }

    item.bgColor   = jpgBgColor;

    var maxSide = Math.max(srcW, srcH);
    if (maxSide > LIMITS.MAX_SIDE && !resize) {
      throw new Error('Maior lado (' + maxSide + 'px) excede ' + LIMITS.MAX_SIDE + 'px e redimensionamento está desligado.');
    }

    var targetW = srcW, targetH = srcH;
    var limitW  = Math.min(mw, LIMITS.MAX_SIDE);
    var limitH  = Math.min(mh, LIMITS.MAX_SIDE);

    if (resize && (srcW > limitW || srcH > limitH)) {
      var ratio = Math.min(limitW / srcW, limitH / srcH);
      targetW   = Math.max(1, Math.floor(srcW * ratio));
      targetH   = Math.max(1, Math.floor(srcH * ratio));
    }
    if (!resize && Math.max(targetW, targetH) > LIMITS.MAX_SIDE) {
      var r2  = LIMITS.MAX_SIDE / Math.max(targetW, targetH);
      targetW = Math.floor(targetW * r2);
      targetH = Math.floor(targetH * r2);
    }

    update(50, resize ? 'Redimensionando para ' + targetW + '×' + targetH + '…' : 'Mantendo dimensões…');

    var canvas    = document.createElement('canvas');
    canvas.width  = targetW;
    canvas.height = targetH;
    var ctx       = canvas.getContext('2d');

    // JPG não suporta transparência — sempre aplica fundo antes de desenhar
    if (format === 'jpg') {
      ctx.fillStyle = jpgBgColor || '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    if (sourceCanvas) {
      ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
      sourceCanvas.width = 1; sourceCanvas.height = 1;
      sourceCanvas = null;
    } else {
      ctx.drawImage(imgEl, 0, 0, targetW, targetH);
      imgEl.src = '';
      imgEl     = null;
      // Detecta transparência para não-HEIC (exibição do badge)
      item.hadAlpha = await detectAlphaFromCanvas(canvas);
    }

    item.bgApplied = format === 'jpg' && item.hadAlpha;

    var mime = 'image/webp';
    var q    = quality;
    var note = 'Comprimindo (qualidade ' + (quality * 100).toFixed(0) + '%)…';

    if (format === 'jpg')       { mime = 'image/jpeg'; }
    else if (format === 'avif') { mime = 'image/avif'; }
    else if (format === 'png')  { mime = 'image/png'; q = undefined; note = 'Gerando PNG (lossless)…'; }

    update(90, note);

    var blob = await canvasToType(canvas, mime, q);

    item.resultBlob = blob;
    item.status     = 'Concluído';
    update(100, item.bgApplied ? 'Concluído (JPG sem transparência)' : 'Concluído');

  } catch (err) {
    item.status   = 'Erro';
    item.stage    = 'Erro';
    item.errorMsg = (err && err.message) ? err.message : String(err);
    updateItem(item);
    updateSummary();
    notify(item.errorMsg);
  }
}

function schedule() {
  if (state.paused) return;
  var conc = state.concurrency;
  while (state.running < conc) {
    var next = state.items.find(function(i) { return i.status === 'Fila'; });
    if (!next) break;
    state.running++;
    processItem(next).finally(function() {
      state.running--;
      schedule();
    });
  }
}

function convertAll() {
  if (!state.items.length) { notify('Adicione arquivos primeiro.'); return; }
  state.paused = false;
  schedule();
  notify('Conversão iniciada.');
}

function pause() {
  state.paused = true;
  notify('Pausado (novos itens não iniciam).');
}

function resume() {
  if (!state.items.length) { notify('Nenhum item na fila.'); return; }
  state.paused = false;
  schedule();
  notify('Retomado.');
}

function clearQueue() {
  state.items.forEach(function(i) {
    if (i.url) URL.revokeObjectURL(i.url);
  });
  state.items   = [];
  state.running = 0;
  state.paused  = false;
  fileList.innerHTML = '';
  updateSummary();
  notify('Fila limpa.');
}

async function downloadZip() {
  var done = state.items.filter(function(i) {
    return i.status === 'Concluído' && i.resultBlob;
  });
  if (!done.length) { notify('Não há arquivos concluídos para zipar.'); return; }

  var zip = new JSZip();
  done.forEach(function(i) { zip.file(toOutName(i.name), i.resultBlob); });

  notify('Gerando ZIP…');
  var blob = await zip.generateAsync({ type: 'blob' }, function(meta) {
    totalText.textContent = 'Compactando: ' + (meta.percent || 0).toFixed(0) + '%';
  });

  var url = URL.createObjectURL(blob);
  var a   = document.createElement('a');
  var ts  = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
  a.href     = url;
  a.download = 'batch_' + formatSel.value + '_' + ts + '.zip';
  a.click();
  setTimeout(function() { URL.revokeObjectURL(url); }, 10000);
  notify('ZIP gerado.');
}

async function addFiles(listLike) {
  var files = Array.from(listLike || []);
  if (!files.length) return;

  var allowed = Math.max(0, LIMITS.MAX_FILES - state.items.length);
  var toAdd   = files.slice(0, allowed);
  if (files.length > toAdd.length) {
    alert('Limite de ' + LIMITS.MAX_FILES + ' arquivos por lote. ' + (files.length - toAdd.length) + ' não foram adicionados.');
  }

  for (var fi = 0; fi < toAdd.length; fi++) {
    var file = toAdd[fi];
    var mb   = file.size / (1024 * 1024);
    if (mb > LIMITS.MAX_FILE_MB) {
      notify('Arquivo muito grande (> ' + LIMITS.MAX_FILE_MB + 'MB): ' + file.name);
      continue;
    }

    var heic = isHeicFile(file);
    if (!heic) {
      var mime = (file.type || '').toLowerCase();
      var ok   = /^image\/(png|jpe?g|webp)$/i.test(mime) || /\.(png|jpe?g|webp)$/i.test(file.name || '');
      if (!ok) { notify('Tipo não suportado: ' + file.name); continue; }
    }

    var id   = state.nextId++;
    var item = {
      id:         id,
      file:       file,
      name:       file.name || ('arquivo-' + id),
      origBytes:  file.size,
      kind:       heic ? 'heic' : 'img',
      status:     'Fila',
      progress:   0,
      stage:      'Fila',
      errorMsg:   '',
      hadAlpha:   false,
      bgApplied:  false,
      bgColor:    '#FFFFFF',
      resultBlob: null,
      url:        null
    };
    state.items.push(item);
    renderItem(item);
  }

  updateSummary();
}
