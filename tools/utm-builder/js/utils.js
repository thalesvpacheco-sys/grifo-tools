// ============================================================
// utils.js — UTM Builder (Grifo Tools)
// Responsabilidade: Logica pura de transformacao e montagem de URL
// Dependencias: nenhuma (sem efeitos colaterais de DOM)
// ============================================================

/**
 * Remove acentos de uma string.
 * Ex: "lancamento" -> "lancamento"
 */
function stripDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Converte uma string para kebab-case limpo.
 * Ex: "Black Friday 2024" -> "black-friday-2024"
 */
function toKebab(str) {
  return stripDiacritics(str)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .toLowerCase();
}

/**
 * Normaliza um valor de campo UTM conforme as opcoes.
 * Retorna null se o valor estiver vazio apos trim.
 */
function normalizeValue(fieldId, rawValue, options) {
  var value = rawValue.trim();
  if (!value) return null;

  var isMainField = ['utm_source', 'utm_medium', 'utm_campaign'].indexOf(fieldId) !== -1;

  if (options.lowercase) {
    value = isMainField ? toKebab(value) : stripDiacritics(value).toLowerCase();
  }

  return value;
}

/**
 * Monta a URL final com os parametros UTM.
 * Retorna objeto { ok: true, url: string } ou { ok: false, error: string }
 */
function buildUtmUrl(state) {
  var raw = state.baseUrl.trim();
  if (!raw) return { ok: false, error: '' };

  var urlObj;
  try {
    urlObj = new URL(raw);
  } catch (e) {
    return { ok: false, error: 'URL invalida. Inclua o protocolo (https://).' };
  }

  var required = [
    { id: 'utm_source',   label: 'utm_source' },
    { id: 'utm_medium',   label: 'utm_medium' },
    { id: 'utm_campaign', label: 'utm_campaign' }
  ];

  for (var i = 0; i < required.length; i++) {
    if (!state[required[i].id].trim()) {
      return { ok: false, error: 'Preencha os campos obrigatorios: utm_source, utm_medium e utm_campaign.' };
    }
  }

  var params = state.options.keepExisting
    ? new URLSearchParams(urlObj.search)
    : new URLSearchParams();

  var fields = ['utm_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  for (var j = 0; j < fields.length; j++) {
    var key = fields[j];
    var normalized = normalizeValue(key, state[key], state.options);
    if (normalized !== null) {
      params.set(key, normalized);
    } else {
      params.delete(key);
    }
  }

  if (state.options.encode) {
    urlObj.search = params.toString();
    return { ok: true, url: urlObj.toString() };
  }

  // encode=false: constroi a query string manualmente sem codificar os valores.
  // Apenas os caracteres estruturais (&, =, #, ?) sao escapados para evitar
  // quebra de URL; espacos e acentos ficam literais.
  var queryParts = [];
  params.forEach(function (value, key) {
    var safeVal = value.replace(/[&=#?]/g, function (c) { return encodeURIComponent(c); });
    queryParts.push(key + '=' + safeVal);
  });
  var queryStr = queryParts.join('&');
  var finalUrl = urlObj.origin + urlObj.pathname + (queryStr ? '?' + queryStr : '') + urlObj.hash;
  return { ok: true, url: finalUrl };
}