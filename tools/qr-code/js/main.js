// ============================================================
// main.js — QR Code (Grifo Tools)
// Responsabilidade: Inicializacao, instancia QR e wire-up de eventos
// Dependencias: config.js, state.js, utils.js, ui.js
// Requer: qr-code-styling (global QRCodeStyling via CDN)
// ============================================================

(function () {

  var qrInstance = null; // instancia de preview (exibicao)

  // ── Inicializa instancia de preview ──────────────────────

  function initQR(state) {
    var previewEl = UI.el('preview');
    var size = getDisplaySize(previewEl);

    qrInstance = new QRCodeStyling({
      width:  size,
      height: size,
      type:   'canvas',
      data:   state.data,
      margin: state.margin,
      qrOptions:         { errorCorrectionLevel: state.ecl, mode: 'Byte' },
      dotsOptions:       { color: state.colorDark,  type: state.dots },
      backgroundOptions: { color: state.colorLight }
    });

    qrInstance.append(previewEl);
  }

  // ── Atualiza preview com o estado atual ──────────────────

  function updatePreview() {
    if (!qrInstance) return;
    var state = State.get();
    var size  = getDisplaySize(UI.el('preview'));

    qrInstance.update({
      width:  size,
      height: size,
      data:   state.data,
      margin: state.margin,
      qrOptions:         { errorCorrectionLevel: state.ecl, mode: 'Byte' },
      dotsOptions:       { color: state.colorDark,  type: state.dots },
      backgroundOptions: { color: state.colorLight }
    });
  }

  // ── Gerar QR (submit do form) ─────────────────────────────

  function handleGenerate(ev) {
    if (ev) ev.preventDefault();

    var previewEl = UI.el('preview');
    var ok = UI.readFormIntoState(previewEl);

    if (!ok) {
      UI.setStatus('Informe um link ou texto.');
      UI.el('data').focus();
      return;
    }

    updatePreview();
    UI.setStatus('QR atualizado.');
  }

  // ── Download (instancia off-screen no tamanho final) ─────

  function handleDownload() {
    var state  = State.get();
    var ext    = state.format === 'svg' ? 'svg' : 'png';
    var mount  = UI.el('exportMount');
    var type   = ext === 'svg' ? 'svg' : 'canvas';

    var qrExport = new QRCodeStyling({
      width:  state.size,
      height: state.size,
      type:   type,
      data:   state.data,
      margin: state.margin,
      qrOptions:         { errorCorrectionLevel: state.ecl, mode: 'Byte' },
      dotsOptions:       { color: state.colorDark,  type: state.dots },
      backgroundOptions: { color: state.colorLight }
    });

    mount.innerHTML = '';

    // Aguarda dois frames para garantir renderizacao antes do download
    qrExport.append(mount);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        qrExport.download({ name: QR_EXPORT_NAME, extension: ext });
        setTimeout(function () { mount.innerHTML = ''; }, 100);
      });
    });
  }

  // ── Link compartilhavel ───────────────────────────────────

  function handleShare() {
    var url = buildShareUrl(State.get());

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(function () { UI.setStatus('Link copiado!'); })
        .catch(function () { UI.setStatus('Link: ' + url); });
    } else {
      UI.setStatus('Link: ' + url);
    }
  }

  // ── Redimensionamento responsivo do preview ───────────────

  function handleResize() {
    if (!qrInstance) return;
    var size = getDisplaySize(UI.el('preview'));
    qrInstance.update({ width: size, height: size });
  }

  // ── Inicializacao ─────────────────────────────────────────

  function init() {
    // Verifica se ha estado na URL (link compartilhavel)
    var fromUrl = parseShareUrl();
    if (fromUrl) {
      State.setMany(fromUrl);
    }

    var state = State.get();

    // Preenche o formulario com o estado inicial
    UI.populateForm(state);

    // Inicializa o QR de preview
    initQR(state);
    UI.setStatus('Pronto. Cole seu link e clique em "Gerar".');

    // Wire-up de eventos
    var form = UI.el('controls');
    if (form) form.addEventListener('submit', handleGenerate);

    var btnDownload = UI.el('btnDownload');
    if (btnDownload) btnDownload.addEventListener('click', handleDownload);

    var btnShare = UI.el('btnShare');
    if (btnShare) btnShare.addEventListener('click', handleShare);

    window.addEventListener('resize', handleResize);
  }

  document.addEventListener('DOMContentLoaded', init);

})();