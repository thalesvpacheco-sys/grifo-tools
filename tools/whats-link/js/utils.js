// ============================================================
// utils.js — WhatsLink (Grifo Tools)
// Responsabilidade: Logica pura — sem efeitos colaterais no DOM
// Dependencias: config.js (NEEDS_FE0F, SKIN, LEGACY_HANDS, KEYCAP_BASE, FE0F, KEYCAP_SEQ)
// ============================================================

var _seg = (window.Intl && Intl.Segmenter)
  ? new Intl.Segmenter('pt-br', { granularity: 'grapheme' })
  : null;

function graphemes(s) {
  return _seg
    ? Array.from(_seg.segment(s), function(x) { return x.segment; })
    : Array.from(s);
}

function applyTone(ch, tone) {
  if (!tone) return ch;
  var cp  = ch.codePointAt(0);
  var mod = SKIN[tone];
  if (!mod) return ch;
  if (LEGACY_HANDS.has(cp)) return ch + FE0F + mod;
  return ch + mod;
}

function fixKeycap(seq) {
  var cp = seq.codePointAt(0);
  if (KEYCAP_BASE.has(cp) && !seq.includes(KEYCAP_SEQ)) return seq + FE0F + KEYCAP_SEQ;
  return seq;
}

function normalizeEmojiString(str) {
  return (str || '')
    .normalize('NFC')
    .replace(/[\uFE0E\uFE0F]/g, '')
    .replace(/[\u200B\u200C\u200D]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function normalizePhone(input, ddi) {
  ddi = ddi || '55';
  var d = String(input || '').replace(/\D+/g, '');
  if (!d) return '';
  if (!d.startsWith(ddi) && d.length <= 11) return ddi + d;
  return d;
}

function formatHumanPhone(input) {
  var d = normalizePhone(input);
  if (!d) return '';
  var ddi = d.slice(0, 2);
  var r   = d.slice(2);
  if (r.length === 10) return '+' + ddi + ' (' + r.slice(0,2) + ') ' + r.slice(2,6) + '-' + r.slice(6);
  if (r.length === 11) return '+' + ddi + ' (' + r.slice(0,2) + ') ' + r.slice(2,7) + '-' + r.slice(7);
  return '+' + ddi + ' ' + r;
}

function isMobileUA() {
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

function openNamed(url, mode) {
  var name = mode === 'web' ? NAMED_TAB.web : (mode === 'wa' ? NAMED_TAB.app : NAMED_TAB.auto);
  window.open(url, name, 'noopener');
}

function _encWhats(s) {
  return encodeURIComponent(s || '').replace(/%0D/g, '').replace(/%20/g, '%20');
}

function buildWhatsUrl(phoneRaw, msg, mode) {
  mode = mode || 'auto';
  var phone = normalizePhone(phoneRaw);
  if (phone.length < 10) throw new Error('N\u00famero inv\u00e1lido. Digite pelo menos 10 d\u00edgitos.');
  var text = _encWhats(msg || '');
  if (mode === 'wa') {
    return 'https://wa.me/' + phone + (text ? '?text=' + text : '');
  }
  if (mode === 'web' || (!isMobileUA() && mode === 'auto')) {
    var q = 'phone=' + phone + (text ? '&text=' + text : '') + '&type=phone_number&app_absent=0';
    return 'https://web.whatsapp.com/send?' + q;
  }
  return 'https://wa.me/' + phone + (text ? '?text=' + text : '');
}

function renderWhatsappLike(t) {
  function esc(s) {
    return s.replace(/[&<>]/g, function(c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]; });
  }
  var x = esc(t || '');
  x = x.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  x = x.replace(/_([^_]+)_/g,    '<em>$1</em>');
  x = x.replace(/~([^~]+)~/g,    '<s>$1</s>');
  x = x.replace(/`([^`]+)`/g, '<code style="background:#eef1f4;padding:1px 4px;border-radius:4px;font-size:0.85em;">$1</code>');
  return x;
}

function nowTime() {
  var d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
