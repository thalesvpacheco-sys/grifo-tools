// ============================================================
// ui.js — Image Converter (Grifo Tools)
// Responsabilidade: Renderização e atualização de itens na lista,
//                   barra de progresso global, notificações e UI de formato
// Dependências: state.js, utils.js, config.js,
//               DOM globals de main.js: fileList, queueInfo, totalBar,
//               totalText, summary, statusLive, formatSel, qualityRange,
//               qualityInput, qualityHint, jpgBgWrap
// ============================================================

function notify(msg) {
  statusLive.textContent = msg;
}

function applyFormatUI() {
  var f     = formatSel.value;
  var isPNG = f === 'png';
  var isJPG = f === 'jpg';

  [qualityRange, qualityInput].forEach(function(el) {
    el.disabled = isPNG;
  });

  qualityHint.textContent = isPNG
    ? 'PNG é lossless — qualidade não se aplica. Em JPG, fundo só é aplicado se houver transparência.'
    : 'WebP/AVIF/JPG usam qualidade; PNG é lossless. Em JPG, fundo só é aplicado se houver transparência.';

  jpgBgWrap.classList.toggle('hidden', !isJPG);
}

function renderItem(item) {
  var li       = document.createElement('li');
  li.id        = 'item-' + item.id;
  li.className = 'p-3 rounded-xl border border-neutral-200 bg-white';
  li.innerHTML =
    '<div class="flex items-center gap-3">' +
      '<div class="h-14 w-14 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">' +
        '<img id="thumb-' + item.id + '" alt="miniatura" class="h-full w-full object-cover hidden" />' +
        '<span id="thumbText-' + item.id + '" class="text-[11px] font-semibold text-neutral-500">' +
          (item.kind === 'heic' ? 'HEIC' : '') +
        '</span>' +
      '</div>' +

      '<div class="flex-1 min-w-0">' +
        '<div class="flex items-center justify-between gap-2">' +
          '<div class="truncate text-sm">' +
            '<span class="text-neutral-800 truncate inline-block max-w-[18rem]" title="' + escapeHtml(item.name) + '">' +
              escapeHtml(item.name) +
            '</span>' +
          '</div>' +
          '<div class="text-xs text-neutral-500" id="size-' + item.id + '">' + fmtBytes(item.origBytes) + '</div>' +
        '</div>' +

        '<div class="mt-2 w-full h-2 bg-neutral-200 rounded-full overflow-hidden">' +
          '<div id="bar-' + item.id + '" class="h-2 bg-brand-600 transition-[width] duration-200" style="width:0%"></div>' +
        '</div>' +

        '<div class="mt-1 text-xs text-neutral-500 flex items-center justify-between">' +
          '<div class="flex items-center gap-2">' +
            '<span id="stage-' + item.id + '">' + escapeHtml(item.stage) + '</span>' +
            '<span id="badge-' + item.id + '" class="hidden px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200"></span>' +
          '</div>' +
          '<span id="eco-' + item.id + '"></span>' +
        '</div>' +

        '<div id="err-' + item.id + '" class="mt-1 text-[11px] text-red-600 hidden"></div>' +
      '</div>' +

      '<div class="flex flex-col gap-2">' +
        '<a id="dl-' + item.id + '" class="px-3 py-2 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-700 pointer-events-none opacity-40 text-center">Baixar</a>' +
        '<button id="re-' + item.id + '" class="px-3 py-2 rounded-lg bg-white border border-neutral-300 text-xs">Reprocessar</button>' +
      '</div>' +
    '</div>';

  fileList.appendChild(li);

  // Thumbnail imediato para formatos não-HEIC
  if (item.kind !== 'heic') {
    var imgTag = li.querySelector('#thumb-'     + item.id);
    var txt    = li.querySelector('#thumbText-' + item.id);
    txt.textContent = '';
    txt.classList.add('hidden');
    imgTag.classList.remove('hidden');
    var r = new FileReader();
    r.onload = function() { imgTag.src = r.result; };
    r.readAsDataURL(item.file);
  }

  // Botão reprocessar
  li.querySelector('#re-' + item.id).addEventListener('click', function() {
    if (item.url) { URL.revokeObjectURL(item.url); item.url = null; }
    item.resultBlob = null;
    item.status     = 'Fila';
    item.progress   = 0;
    item.stage      = 'Fila';
    item.errorMsg   = '';
    updateItem(item);
    schedule(); // schedule() está em processor.js (global)
  });
}

function updateItem(item) {
  var bar    = document.querySelector('#bar-'   + item.id);
  var stage  = document.querySelector('#stage-' + item.id);
  var eco    = document.querySelector('#eco-'   + item.id);
  var size   = document.querySelector('#size-'  + item.id);
  var dl     = document.querySelector('#dl-'    + item.id);
  var badge  = document.querySelector('#badge-' + item.id);
  var errBox = document.querySelector('#err-'   + item.id);

  if (bar)   bar.style.width   = Math.floor(item.progress) + '%';
  if (stage) stage.textContent = item.stage || '';

  if (errBox) {
    if (item.errorMsg) {
      errBox.textContent = item.errorMsg;
      errBox.classList.remove('hidden');
    } else {
      errBox.classList.add('hidden');
    }
  }

  if (badge) {
    if (item.hadAlpha && item.status !== 'Erro') {
      var f = formatSel.value;
      if (f === 'jpg' && item.bgApplied) {
        badge.textContent = 'JPG: fundo ' + (item.bgColor || '#FFFFFF').toUpperCase();
        badge.classList.remove('hidden');
      } else if (f !== 'jpg') {
        badge.textContent = 'Transparência preservada';
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    } else {
      badge.classList.add('hidden');
    }
  }

  if (item.resultBlob) {
    var saving = item.origBytes - item.resultBlob.size;
    var pct    = item.origBytes ? (saving / item.origBytes) * 100 : 0;
    if (eco)  eco.textContent  = fmtBytes(item.origBytes) + ' → ' + fmtBytes(item.resultBlob.size) + ' (' + (pct > 0 ? '-' : '') + pct.toFixed(0) + '%)';
    if (size) size.textContent = fmtBytes(item.resultBlob.size);

    if (dl) {
      dl.classList.remove('opacity-40', 'pointer-events-none');
      if (!item.url) { item.url = URL.createObjectURL(item.resultBlob); }
      dl.href     = item.url;
      dl.download = toOutName(item.name);
    }

    // Exibe thumbnail para HEIC após conversão
    if (item.kind === 'heic') {
      var imgTag = document.querySelector('#thumb-'     + item.id);
      var txt    = document.querySelector('#thumbText-' + item.id);
      if (imgTag && txt) {
        txt.classList.add('hidden');
        imgTag.classList.remove('hidden');
        imgTag.src = item.url;
      }
    }
  }
}

function updateSummary() {
  var total = state.items.length;
  var done  = state.items.filter(function(i) { return i.status === 'Concluído'; }).length;
  summary.textContent   = total + ' itens · ' + done + ' concluídos';
  queueInfo.textContent = total ? (total + ' arquivo(s) na fila') : 'Nenhum arquivo adicionado';

  var avg = total
    ? state.items.reduce(function(a, i) { return a + (i.progress || 0); }, 0) / total
    : 0;
  totalBar.style.width  = avg.toFixed(0) + '%';
  totalText.textContent = done + '/' + total + ' concluídos (' + avg.toFixed(0) + '%)';
}
