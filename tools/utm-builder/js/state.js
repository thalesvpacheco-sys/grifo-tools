// ============================================================
// state.js — UTM Builder (Grifo Tools)
// Responsabilidade: Estado da aplicacao (unica fonte de verdade)
// Dependencias: config.js
// ============================================================

var State = (function () {
  var _state = {
    baseUrl:      '',
    utm_id:       '',
    utm_source:   '',
    utm_medium:   '',
    utm_campaign: '',
    utm_term:     '',
    utm_content:  '',
    options: {
      lowercase:    UTM_OPTIONS_DEFAULTS.lowercase,
      keepExisting: UTM_OPTIONS_DEFAULTS.keepExisting,
      encode:       UTM_OPTIONS_DEFAULTS.encode
    },
    builtUrl: ''
  };

  function get() {
    return _state;
  }

  function setField(key, value) {
    if (key in _state) {
      _state[key] = value;
    }
  }

  function setOption(key, value) {
    if (key in _state.options) {
      _state.options[key] = value;
    }
  }

  function setBuiltUrl(url) {
    _state.builtUrl = url;
  }

  function reset() {
    _state.baseUrl      = '';
    _state.utm_id       = '';
    _state.utm_source   = '';
    _state.utm_medium   = '';
    _state.utm_campaign = '';
    _state.utm_term     = '';
    _state.utm_content  = '';
    _state.options.lowercase    = UTM_OPTIONS_DEFAULTS.lowercase;
    _state.options.keepExisting = UTM_OPTIONS_DEFAULTS.keepExisting;
    _state.options.encode       = UTM_OPTIONS_DEFAULTS.encode;
    _state.builtUrl = '';
  }

  return { get: get, setField: setField, setOption: setOption, setBuiltUrl: setBuiltUrl, reset: reset };
})();