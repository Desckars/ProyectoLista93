// ── CONFIGURACIÓN GLOBAL ──────────────────────────
const SUPABASE_URL = 'https://lnqqmoflqbbgxstxlujy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ehNfp-wrQtIqlDbtNesRww_iFNWR-H3';
const BUCKET       = 'imagenes';
const BUCKET_PIZ   = 'pizzarron';
const PAGE_SIZE    = 10;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Content-Type': 'application/json'
};

let puedeEditar = false;

// ── HELPERS COMPARTIDOS ───────────────────────────
function getUruguayDate() {
  return new Date().toLocaleDateString('sv', { timeZone: 'America/Montevideo' });
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-UY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'America/Montevideo'
  });
}

function escapeHtml(text) {
  return text
    ? text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
           .replace(/"/g,'&quot;').replace(/'/g,'&#039;')
    : '';
}

function mostrarAvisoSinPermiso() {
  mostrarStatus('⚠️ No tenés permisos para realizar esta acción', 'error');
  setTimeout(() => mostrarStatus('', ''), 3000);
}