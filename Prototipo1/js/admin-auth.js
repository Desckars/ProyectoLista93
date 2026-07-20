// ── LOGIN ─────────────────────────────────────────
async function login() {
  const usuario  = document.getElementById('input-usuario').value.trim();
  const password = document.getElementById('input-pass').value;
  const btnLogin = document.getElementById('btn-login');
  const errorEl  = document.getElementById('error-login');

  if (!usuario || !password) {
    errorEl.textContent = 'Ingresá usuario y contraseña';
    errorEl.style.display = 'block';
    return;
  }

  btnLogin.disabled = true;
  btnLogin.textContent = 'Verificando...';
  errorEl.style.display = 'none';

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verificar_admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_usuario: usuario, p_password: password })
    });

    const data = await res.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      errorEl.textContent = 'Usuario o contraseña incorrectos';
      errorEl.style.display = 'block';
      btnLogin.disabled = false;
      btnLogin.textContent = 'Ingresar';
      return;
    }

    const admin = data[0];
    puedeEditar = admin.editar === true;

    document.getElementById('pantalla-login').style.display = 'none';
    document.getElementById('pantalla-panel').style.display = 'block';
    document.getElementById('input-fecha').value = getUruguayDate();

    aplicarPermisos();
    cargarPublicaciones();
    cargarCalendario();
    cargarGaleriaPiz();

  } catch (err) {
    errorEl.textContent = 'Error de conexión. Intentá de nuevo.';
    errorEl.style.display = 'block';
    btnLogin.disabled = false;
    btnLogin.textContent = 'Ingresar';
  }
}

// ── PERMISOS ──────────────────────────────────────
function aplicarPermisos() {
  const badge       = document.getElementById('badge-editar');
  const aviso       = document.getElementById('aviso-readonly');
  const btnSubir    = document.getElementById('btn-subir');
  const btnCal      = document.getElementById('btn-calendario');
  const uploadBox   = document.getElementById('upload-box');
  const labelElegir = document.getElementById('label-elegir');

  badge.style.display = 'inline-block';

  if (puedeEditar) {
    badge.textContent      = '✏️ Editor';
    badge.style.background = '#1a3a2a';
    badge.style.color      = '#4ade80';
    aviso.style.display    = 'none';
  } else {
    badge.textContent      = '👁️ Solo lectura';
    badge.style.background = '#2a1a0a';
    badge.style.color      = '#f4a460';
    aviso.style.display    = 'block';

    btnSubir.disabled             = true;
    btnSubir.style.opacity        = '0.4';
    btnSubir.style.cursor         = 'not-allowed';
    btnCal.disabled               = true;
    btnCal.style.opacity          = '0.4';
    btnCal.style.cursor           = 'not-allowed';
    uploadBox.style.opacity       = '0.4';
    uploadBox.style.pointerEvents = 'none';
    labelElegir.style.cursor      = 'not-allowed';

    ['input-titulo', 'input-desc', 'input-calendario'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.disabled = true; el.style.opacity = '0.5'; }
    });
  }
}

// ── SALIR ─────────────────────────────────────────
function salir() {
  puedeEditar = false;
  document.getElementById('pantalla-panel').style.display  = 'none';
  document.getElementById('pantalla-login').style.display  = 'block';
  document.getElementById('input-usuario').value           = '';
  document.getElementById('input-pass').value              = '';
  document.getElementById('btn-login').disabled            = false;
  document.getElementById('btn-login').textContent         = 'Ingresar';
  document.getElementById('error-login').style.display     = 'none';
}