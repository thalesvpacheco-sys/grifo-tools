// ============================================================
// config.js — WhatsLink (Grifo Tools)
// Responsabilidade: Constantes, templates e dados do emoji picker
// Dependencias: nenhuma
// ============================================================

var TOAST_DURATION_MS = 2000;

var NAMED_TAB = {
  web:  'WHATS_WEB_TAB',
  app:  'WHATS_APP_TAB',
  auto: 'WHATS_AUTO_TAB'
};

var FE0F       = '\uFE0F';
var KEYCAP_SEQ = '\u20E3';

var NEEDS_FE0F = new Set([
  0x2600,0x2601,0x2602,0x2603,0x260E,0x2611,0x2614,0x2615,0x2618,0x261D,
  0x2620,0x2622,0x2623,0x2626,0x262A,0x262E,0x262F,0x2638,0x2639,0x263A,
  0x2648,0x2649,0x264A,0x264B,0x264C,0x264D,0x264E,0x264F,0x2650,0x2651,
  0x2652,0x2653,0x2660,0x2663,0x2665,0x2666,0x2668,0x267B,0x267F,0x2692,
  0x2693,0x2694,0x2696,0x2697,0x2699,0x269B,0x269C,0x26A0,0x26A1,0x26AA,
  0x26AB,0x26B0,0x26B1,0x26BD,0x26BE,0x26C4,0x26C5,0x26C8,0x26CE,0x26CF,
  0x26D1,0x26D3,0x26D4,0x26E9,0x26EA,0x26F0,0x26F1,0x26F2,0x26F3,0x26F4,
  0x26F5,0x26F7,0x26F8,0x26F9,0x26FA,0x26FD,0x2702,0x2705,0x2708,0x2709,
  0x270A,0x270B,0x270C,0x270D,0x270F,0x2712,0x2714,0x2716,0x271D,0x2721,
  0x2728,0x2733,0x2734,0x2744,0x2747,0x274C,0x274E,0x2753,0x2754,0x2755,
  0x2757,0x2763,0x2764,0x27A1,0x2934,0x2935,0x2B05,0x2B06,0x2B07,0x2B1B,
  0x2B1C,0x2B50,0x2B55
]);

var SKIN = {
  1: String.fromCodePoint(0x1F3FB),
  2: String.fromCodePoint(0x1F3FC),
  3: String.fromCodePoint(0x1F3FD),
  4: String.fromCodePoint(0x1F3FE),
  5: String.fromCodePoint(0x1F3FF)
};

var LEGACY_HANDS = new Set([0x270A, 0x270B, 0x270C, 0x270D, 0x261D]);
var KEYCAP_BASE  = new Set([0x0023,0x002A,0x0030,0x0031,0x0032,0x0033,0x0034,0x0035,0x0036,0x0037,0x0038,0x0039]);

var EMOJI_CATEGORIES = [
  { key: 'smileys', label: 'Rostos',  set: '\uD83D\uDE00\uD83D\uDE01\uD83D\uDE02\uD83E\uDD23\uD83D\uDE03\uD83D\uDE04\uD83D\uDE05\uD83D\uDE09\uD83D\uDE0A\uD83D\uDE42\uD83D\uDE43\uD83D\uDE0D\uD83E\uDD70\uD83D\uDE18\uD83D\uDE17\uD83D\uDE19\uD83D\uDE1A\uD83E\uDD17\uD83E\uDD2D\uD83E\uDD2B\uD83E\uDD14\uD83D\uDE10\uD83D\uDE11\uD83D\uDE44\uD83D\uDE2E\uD83D\uDE34\uD83D\uDE2E\uD83D\uDE32\uD83D\uDE33\uD83E\uDD75\uD83E\uDD76\uD83D\uDE31\uD83D\uDE2D\uD83D\uDE14\uD83D\uDE15\uD83D\uDE1F\uD83D\uDE24\uD83E\uDD2F\uD83E\uDD73\uD83D\uDE0E\uD83E\uDD13' },
  { key: 'hands',   label: 'Gestos',  set: '\uD83D\uDC4D\uD83D\uDC4E\uD83D\uDC4F\uD83D\uDE4C\uD83D\uDE4F\uD83D\uDC4B\uD83E\uDD1D\uD83D\uDC4C\uD83E\uDD0F\u270C\uFE0F\u261D\uFE0F\u270B\u270D\uFE0F\uD83D\uDC47\uD83D\uDC46\uD83D\uDC49\uD83D\uDC48\u270A\uD83D\uDC4A' },
  { key: 'objects', label: 'Objetos', set: '\uD83D\uDCDE\uD83D\uDCF1\uD83D\uDCBB\uD83E\uDDFE\uD83D\uDD8A\u2712\uFE0F\uD83D\uDCC5\uD83D\uDCC6\u23F0\u23F1\uFE0F\uD83D\uDCE6\uD83C\uDFF7\uFE0F\uD83D\uDCB3\uD83D\uDCB0\uD83D\uDCC8\uD83D\uDCC9\uD83D\uDCCA\uD83D\uDCCC\uD83D\uDCCD\u2709\uFE0F\uD83D\uDCCE\uD83D\uDD12\uD83D\uDD13\uD83D\uDD11' },
  { key: 'symbols', label: 'Sinais',  set: '\u26A0\uFE0F\uD83D\uDEAB\u2705\u274C\u2757\u2755\u2753\u2754\u2B50\u2728\uD83D\uDD25\uD83C\uDFAF\uD83D\uDE80\uD83D\uDCA1\uD83D\uDCAC\uD83C\uDD95\uD83D\uDD1D' }
];

var DEFAULT_TPLS = [
  { name: 'Boas-vindas',
    text: '\uD83D\uDC4B Ol\u00e1! Obrigado por entrar em contato. Como posso ajudar voc\u00ea hoje?' },
  { name: 'Follow-up',
    text: '\uD83D\uDD01 Oi! Estou acompanhando nosso \u00faltimo contato. Ficou alguma d\u00favida sobre o que conversamos?' },
  { name: 'Recupera\u00e7\u00e3o de Leads',
    text: '\uD83D\uDCE3 Vi que voc\u00ea demonstrou interesse em nossos servi\u00e7os. Gostaria de retomar nossa conversa?' },
  { name: 'Promo\u00e7\u00e3o',
    text: '\uD83D\uDD25 *OFERTA ESPECIAL*\nAproveite nossa promo\u00e7\u00e3o!\n\nUse o c\u00f3digo *PROMO10* e ganhe *10% OFF*' },
  { name: 'Agendamento',
    text: '\uD83D\uDDD3\uFE0F Gostaria de agendar um hor\u00e1rio? *Hor\u00e1rios dispon\u00edveis:*\n\u2713 9h \u00e0s 10h\n\u2713 14h \u00e0s 15h\n\u2713 16h \u00e0s 17h' },
  { name: 'P\u00f3s-venda',
    text: '\u2728 Como foi sua experi\u00eancia com nosso produto/servi\u00e7o? *Sua opini\u00e3o \u00e9 muito importante!*' },
  { name: 'Lembrete de Reuni\u00e3o',
    text: '\u23F0 *Lembrete da nossa reuni\u00e3o*\n*Data:* [data]\n*Hor\u00e1rio:* [hor\u00e1rio]\n*Link:* [link]' },
  { name: 'Or\u00e7amento',
    text: '\uD83D\uDCB0 *Or\u00e7amento Solicitado*\nProduto/Servi\u00e7o: [nome]\nValor: R$ [valor]\nPrazo: [prazo]\nPosso ajudar com mais informa\u00e7\u00f5es?' },
  { name: 'Suporte T\u00e9cnico',
    text: '\uD83D\uDEE0\uFE0F *Suporte T\u00e9cnico*\nPara agilizar seu atendimento, descreva: 1) O problema, 2) Quando ocorre, 3) J\u00e1 tentou alguma solu\u00e7\u00e3o?' }
];
