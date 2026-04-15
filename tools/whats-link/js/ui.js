// ============================================================
// ui.js — WhatsLink (Grifo Tools)
// Responsabilidade: Manipulacao de DOM, toast, preview de bolha,
//   emoji picker, templates, modal de validacao
// Dependencias: config.js, state.js, utils.js
// ============================================================

var UI = (function () {

  var _toastTimer  = null;
  var _currentTab  = 'smileys';

  // ── Helpers ────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  // ── Toast ──────────────────────────────────────────────────
  function showToast(msg) {
    var t = el('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.opacity   = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () {
      t.style.opacity   = '0';
      t.style.transform = 'translateX(-50%) translateY(8px)';
    }, TOAST_DURATION_MS);
  }

  // ── Preview de bolha ───────────────────────────────────────
  function updateMessage() {
    var msg      = el('message').value || '';
    var countEl  = el('charCount');
    var bubbleEl = el('bubble');
    var timeEl   = el('bubbleTime');
    if (countEl)  countEl.textContent  = msg.length + ' caracteres';
    if (bubbleEl) bubbleEl.innerHTML   = renderWhatsappLike(msg.trim() ? msg : 'Sua mensagem aparecerá aqui\u2026');
    if (timeEl)   timeEl.textContent   = nowTime();
  }

  // ── Validação de número ────────────────────────────────────
  function updatePhone() {
    var p     = el('phone').value;
    var f     = formatHumanPhone(p);
    var normEl= el('normalizedPhone');
    var badge = el('phoneBadge');
    if (normEl) normEl.textContent = f || '+55 \u2022 aguardando n\u00famero\u2026';
    if (badge) {
      var d = normalizePhone(p);
      if (d && d.length >= 10) {
        badge.innerHTML = '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0">V\u00e1lido</span>';
      } else {
        badge.innerHTML = '<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500;background:#fffbeb;color:#92400e;border:1px solid #fde68a">Incompleto</span>';
      }
    }
  }

  // ── Gerar URL ──────────────────────────────────────────────
  function tryBuildUrl() {
    try {
      var url = buildWhatsUrl(
        el('phone').value,
        normalizeEmojiString(el('message').value),
        AppState.mode
      );
      el('resultUrl').value = url;
      AppState.lastUrl = url;
      return url;
    } catch (e) {
      showToast(e.message || 'Erro ao gerar link');
      return null;
    }
  }

  // ── CTA card ───────────────────────────────────────────────
  function showCtaCard(url) {
    var card = el('ctaCard');
    if (!card) return;
    card.classList.remove('hidden');
    var copyBtn = el('ctaCopy');
    if (copyBtn) {
      copyBtn.onclick = function () {
        navigator.clipboard.writeText(url).then(function () {
          showToast('Link copiado!');
        }).catch(function () {
          showToast('N\u00e3o foi poss\u00edvel copiar');
        });
      };
    }
  }

  // ── Emoji picker ───────────────────────────────────────────
  function buildTabs() {
    var tabsEl = el('emojiTabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = '';
    EMOJI_CATEGORIES.forEach(function (cat, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cat.label;
      btn.className = i === 0
        ? 'emoji-tab active'
        : 'emoji-tab';
      btn.addEventListener('click', function () {
        Array.from(tabsEl.children).forEach(function (x) { x.classList.remove('active'); });
        btn.classList.add('active');
        _currentTab = cat.key;
        renderGrid(_currentTab);
      });
      tabsEl.appendChild(btn);
    });
  }

  function renderGrid(tabKey) {
    var grid = el('emojiGrid');
    if (!grid) return;
    var q = (el('emojiSearch').value || '').trim().toLowerCase();

    var chars;
    if (q) {
      // Pesquisa em todas as categorias
      var all = '';
      EMOJI_CATEGORIES.forEach(function (c) { all += c.set; });
      chars = Array.from(all).filter(function (ch) { return ch.trim(); });
    } else {
      var cat = EMOJI_CATEGORIES.filter(function (c) { return c.key === tabKey; })[0]
             || EMOJI_CATEGORIES[0];
      chars = Array.from(cat.set).filter(function (ch) { return ch.trim(); });
    }

    grid.innerHTML = '';
    chars.forEach(function (ch) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = ensureEmojiStyle(ch);
      btn.addEventListener('click', function () { insertEmoji(ch); });
      grid.appendChild(btn);
    });
  }

  function insertEmoji(ch) {
    var ta = el('message');
    var s  = ta.selectionStart;
    var e  = ta.selectionEnd;
    ta.setRangeText(normalizeEmojiString(ch), s, e, 'end');
    ta.focus();
    updateMessage();
    el('emojiPop').classList.add('hidden');
  }

  // ── Templates ──────────────────────────────────────────────
  function renderTemplates() {
    var box = el('templates');
    if (!box) return;
    box.innerHTML = '';
    DEFAULT_TPLS.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3';

      var left = document.createElement('div');
      left.className = 'flex-1 min-w-0';

      var title = document.createElement('div');
      title.className = 'text-sm font-medium text-neutral-800';
      title.textContent = t.name;

      var preview = document.createElement('div');
      preview.className = 'text-xs text-neutral-500 mt-0.5 truncate';
      preview.textContent = t.text.length > 80 ? t.text.slice(0, 80) + '\u2026' : t.text;

      left.appendChild(title);
      left.appendChild(preview);

      var apply = document.createElement('button');
      apply.type = 'button';
      apply.className = 'shrink-0 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors';
      apply.textContent = 'Usar';
      apply.addEventListener('click', function () {
        el('message').value = normalizeEmojiString(t.text);
        updateMessage();
        showToast('Exemplo aplicado');
      });

      row.appendChild(left);
      row.appendChild(apply);
      box.appendChild(row);
    });
  }

  // ── Modal de validacao ─────────────────────────────────────
  function renderValidateModal() {
    var list  = el('valList');
    if (!list) return;
    list.innerHTML = '';
    var phone = el('phone').value;
    var msg   = normalizeEmojiString(el('message').value);
    var modes = [
      { label: 'Autom\u00e1tico (detec\u00e7\u00e3o)', mode: 'auto' },
      { label: 'WhatsApp App (wa.me)',              mode: 'wa'   },
      { label: 'WhatsApp Web',                      mode: 'web'  }
    ];
    modes.forEach(function (it) {
      try {
        var url = buildWhatsUrl(phone, msg, it.mode);
        var row = document.createElement('div');
        row.className = 'space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4';

        var labelEl = document.createElement('div');
        labelEl.className = 'text-sm font-semibold text-neutral-800';
        labelEl.textContent = it.label;

        var urlInput = document.createElement('input');
        urlInput.readOnly = true;
        urlInput.className = 'w-full px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 text-xs font-mono';
        urlInput.value = url;

        var actions = document.createElement('div');
        actions.className = 'flex gap-2';

        var openBtn = document.createElement('button');
        openBtn.type = 'button';
        openBtn.className = 'px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors';
        openBtn.textContent = 'Abrir';
        openBtn.onclick = function () { openNamed(url, it.mode); };

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors';
        copyBtn.textContent = 'Copiar';
        copyBtn.onclick = function () {
          navigator.clipboard.writeText(url).then(function () { showToast('Copiado!'); });
        };

        actions.appendChild(openBtn);
        actions.appendChild(copyBtn);
        row.appendChild(labelEl);
        row.appendChild(urlInput);
        row.appendChild(actions);
        list.appendChild(row);
      } catch (e) { /* pula modo inválido */ }
    });
  }

  return {
    el:                  el,
    showToast:           showToast,
    updateMessage:       updateMessage,
    updatePhone:         updatePhone,
    tryBuildUrl:         tryBuildUrl,
    showCtaCard:         showCtaCard,
    buildTabs:           buildTabs,
    renderGrid:          renderGrid,
    insertEmoji:         insertEmoji,
    renderTemplates:     renderTemplates,
    renderValidateModal: renderValidateModal
  };

})();
