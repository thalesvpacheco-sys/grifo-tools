// ============================================================
// main.js — WhatsLink (Grifo Tools)
// Responsabilidade: Inicializacao e event listeners
// Dependencias: config.js, state.js, utils.js, ui.js
// ============================================================

(function () {

  var el = UI.el;

  // ── Inicializacao ────────────────────────────────────────
  UI.buildTabs();
  UI.renderGrid('smileys');
  UI.renderTemplates();
  UI.updateMessage();
  UI.updatePhone();

  // ── Input: mensagem ───────────────────────────────────────
  el('message').addEventListener('input', function () {
    var ta     = el('message');
    var caret  = ta.selectionStart;
    var before = ta.value;
    var fixed  = normalizeEmojiString(before);
    if (fixed !== before) {
      var delta = fixed.length - before.length;
      ta.value = fixed;
      ta.selectionStart = ta.selectionEnd = caret + delta;
    }
    UI.updateMessage();
  });

  // ── Input: numero ─────────────────────────────────────────
  el('phone').addEventListener('input', UI.updatePhone);

  // ── Botao: Gerar Link ─────────────────────────────────────
  el('btnGenerate').addEventListener('click', function () {
    var url = UI.tryBuildUrl();
    if (url) {
      UI.showToast('Link gerado com sucesso!');
      UI.showCtaCard(url);
    }
  });

  // ── Botao: Abrir WhatsApp ─────────────────────────────────
  el('btnOpen').addEventListener('click', function () {
    var url = UI.tryBuildUrl();
    if (!url) return;
    var mode = AppState.mode;
    if (mode === 'web' || (!isMobileUA() && mode === 'auto')) mode = 'web';
    else if (mode === 'wa') mode = 'wa';
    else mode = 'auto';
    openNamed(url, mode);
  });

  // ── Botao: Copiar Link ────────────────────────────────────
  el('btnCopy').addEventListener('click', function () {
    var url = UI.tryBuildUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(function () {
      UI.showToast('Link copiado!');
    }).catch(function () {
      UI.showToast('N\u00e3o foi poss\u00edvel copiar');
    });
  });

  // ── Botao: Validar Links ──────────────────────────────────
  el('btnValidate').addEventListener('click', function () {
    var url = UI.tryBuildUrl();
    if (!url) return;
    UI.renderValidateModal();
    document.getElementById('validateModal').showModal();
  });

  el('valClose').addEventListener('click', function () {
    document.getElementById('validateModal').close();
  });

  document.getElementById('validateModal').addEventListener('click', function (e) {
    if (e.target === document.getElementById('validateModal')) {
      document.getElementById('validateModal').close();
    }
  });

  // ── Destino (dropdown) ────────────────────────────────────
  el('destBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    el('destMenu').classList.toggle('hidden');
  });

  el('destMenu').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-mode]');
    if (!btn) return;
    AppState.mode = btn.dataset.mode;
    el('destLabel').textContent = btn.textContent.trim();
    el('destMenu').classList.add('hidden');
  });

  document.addEventListener('click', function (e) {
    if (!el('destBtn').contains(e.target) && !el('destMenu').contains(e.target)) {
      el('destMenu').classList.add('hidden');
    }
  });

  // ── Toolbar: wraps de formatacao ──────────────────────────
  Array.from(document.querySelectorAll('.toolbar-btn[data-wrap]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.dataset.wrap;
      var ta   = el('message');
      var s    = ta.selectionStart;
      var end  = ta.selectionEnd;
      var sel  = ta.value.slice(s, end) || 'texto';
      ta.setRangeText(wrap + sel + wrap, s, end, 'end');
      ta.focus();
      UI.updateMessage();
    });
  });

  // ── Emoji picker ──────────────────────────────────────────
  el('emojiBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    var pop = el('emojiPop');
    pop.classList.toggle('hidden');
    if (!pop.classList.contains('hidden')) el('emojiSearch').focus();
  });

  document.addEventListener('click', function (e) {
    var pop = el('emojiPop');
    if (!pop || pop.classList.contains('hidden')) return;
    var toolbar = document.getElementById('toolbar');
    if (toolbar && !toolbar.contains(e.target)) pop.classList.add('hidden');
  });

  el('emojiSearch').addEventListener('input', function () {
    var q = el('emojiSearch').value.trim();
    UI.renderGrid(q ? 'smileys' : UI._currentTab || 'smileys');
  });

  // Tons de pele (visual apenas — tone=0 fixo na normalizacao)
  Array.from(document.querySelectorAll('.tone-btn')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      Array.from(document.querySelectorAll('.tone-btn')).forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
    });
  });

})();
