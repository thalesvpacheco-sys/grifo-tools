// ============================================================
// config.js — UTM Builder (Grifo Tools)
// Responsabilidade: Constantes globais e configuracoes imutaveis
// Dependencias: nenhuma
// ============================================================

var UTM_FIELDS = [
  { id: 'baseUrl',      label: 'Website URL',     required: true,  placeholder: 'https://exemplo.com/pagina', type: 'url' },
  { id: 'utm_id',       label: 'utm_id',          required: false, placeholder: 'ex: sale-24',               type: 'text' },
  { id: 'utm_source',   label: 'utm_source',      required: true,  placeholder: 'ex: instagram',             type: 'text' },
  { id: 'utm_medium',   label: 'utm_medium',      required: true,  placeholder: 'ex: cpc',                   type: 'text' },
  { id: 'utm_campaign', label: 'utm_campaign',    required: true,  placeholder: 'ex: lancamento-verao',      type: 'text' },
  { id: 'utm_term',     label: 'utm_term',        required: false, placeholder: 'ex: tenis-masculino',       type: 'text' },
  { id: 'utm_content',  label: 'utm_content',     required: false, placeholder: 'ex: cta-topo',              type: 'text' }
];

var UTM_OPTIONS_DEFAULTS = {
  lowercase: true,
  keepExisting: true,
  encode: true
};

var TOAST_DURATION_MS = 1800;