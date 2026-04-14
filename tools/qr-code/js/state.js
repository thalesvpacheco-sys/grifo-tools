// ============================================================
// state.js — QR Code (Grifo Tools)
// Responsabilidade: Estado da aplicacao (unica fonte de verdade)
// Dependencias: config.js
// ============================================================

var State = (function () {
  var _state = {
    data:       QR_DEFAULTS.data,
    size:       QR_DEFAULTS.size,
    margin:     QR_DEFAULTS.margin,
    ecl:        QR_DEFAULTS.ecl,
    colorDark:  QR_DEFAULTS.colorDark,
    colorLight: QR_DEFAULTS.colorLight,
    format:     QR_DEFAULTS.format,
    dots:       QR_DEFAULTS.dots
  };

  function get() {
    // Retorna copia rasa para prevenir mutacao externa acidental
    return {
      data:       _state.data,
      size:       _state.size,
      margin:     _state.margin,
      ecl:        _state.ecl,
      colorDark:  _state.colorDark,
      colorLight: _state.colorLight,
      format:     _state.format,
      dots:       _state.dots
    };
  }

  function set(key, value) {
    if (key in _state) {
      _state[key] = value;
    }
  }

  function setMany(obj) {
    Object.keys(obj).forEach(function (key) {
      set(key, obj[key]);
    });
  }

  function reset() {
    setMany(QR_DEFAULTS);
  }

  return { get: get, set: set, setMany: setMany, reset: reset };
})();