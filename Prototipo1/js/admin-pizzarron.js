// ── ESTADO ────────────────────────────────────────
let archivoPiz = null;

// ── ARCHIVO / PREVIEW ─────────────────────────────
function onArchivoElegidoPiz(e) {
  const file = e.target.files[0];
  if (file) mostrarPreviewPiz(file);
}

function onDropPiz(e) {
  e.preventDefault();
  document.getElementById('upload-box-piz').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) mostrarPreviewPiz(file);
}

function mostrarPreviewPiz(file) {
  if (!puedeEditar) return;
  archivoPiz = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('preview-img-piz').src            = e.target.result;
    document.getElementById('preview-nombre-piz').textContent = file.name;
    document.getElementById('preview-container-piz').style.display = 'block';
    document.getElementById('btn-subir-piz').disabled = false;
  };
  reader.readAsDataURL(file);
}

function mostrarStatusPiz(msg, tipo) {
  const el = document.getElementById('status-piz');
  el.textContent      = msg;
  el.style.display    = msg ? 'block' : 'none';
  el.style.background = tipo === 'ok' ? '#1a3a2a' : '#3a1a1a';
  el.style.color      = tipo === 'ok' ? '#4ade80' : '#ff6b6b';
}

function limpiarFormPiz() {
  archivoPiz = null;
  document.getElementById('input-archivo-piz').value              = '';
  document.getElementById('preview-container-piz').style.display  = 'none';
  document.getElementById('btn-subir-piz').disabled               = true;
}

// ── SUBIR AL PIZZARÓN ─────────────────────────────
async function subirPizzarron() {
  if (!puedeEditar) return;
  if (!archivoPiz)  { mostrarStatusPiz('⚠️ Seleccioná una imagen', 'error'); return; }

  document.getElementById('btn-subir-piz').disabled            = true;
  document.getElementById('barra-container-piz').style.display = 'block';
  document.getElementById('barra-progreso-piz').style.width    = '30%';
  document.getElementById('barra-texto-piz').textContent       = 'Subiendo imagen...';
  mostrarStatusPiz('', '');

  try {
    const ext    = archivoPiz.name.split('.').pop();
    const nombre = 'piz_' + Date.now() + '.' + ext;

    const resStorage = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET_PIZ}/${nombre}`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': archivoPiz.type,
          'x-upsert': 'true'
        },
        body: archivoPiz
      }
    );

    if (!resStorage.ok) throw new Error('Error al subir la imagen');

    document.getElementById('barra-progreso-piz').style.width = '70%';
    document.getElementById('barra-texto-piz').textContent    = 'Guardando en base de datos...';

    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_PIZ}/${nombre}`;

    const resDB = await fetch(`${SUPABASE_URL}/rest/v1/pizzarron`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ url_foto: url })
    });

    if (!resDB.ok) throw new Error('Error al guardar en base de datos');

    document.getElementById('barra-progreso-piz').style.width = '100%';
    setTimeout(() => {
      document.getElementById('barra-container-piz').style.display = 'none';
      document.getElementById('barra-progreso-piz').style.width    = '0%';
    }, 600);

    mostrarStatusPiz('✅ Imagen agregada al pizzarón', 'ok');
    limpiarFormPiz();
    cargarGaleriaPiz();

  } catch (err) {
    document.getElementById('barra-container-piz').style.display = 'none';
    mostrarStatusPiz('❌ ' + err.message, 'error');
    document.getElementById('btn-subir-piz').disabled = false;
  }
}

// ── CARGAR GALERÍA ────────────────────────────────
async function cargarGaleriaPiz() {
  const grid = document.getElementById('galeria-piz');
  grid.innerHTML = '<div style="color:#8899aa; font-size:13px;">Cargando...</div>';
  try {
    const res   = await fetch(
      `${SUPABASE_URL}/rest/v1/pizzarron?select=*&order=created_at.desc`,
      { headers }
    );
    const fotos = await res.json();

    if (!fotos.length) {
      grid.innerHTML = '<div style="color:#8899aa; font-size:13px;">No hay imágenes todavía</div>';
      return;
    }

    grid.innerHTML = fotos.map(f => `
      <div style="position:relative; border-radius:6px; overflow:hidden; background:#1a2634;"
           id="piz-item-${f.id}">
        <img src="${f.url_foto}" alt="foto pizzarón"
          style="width:100%; height:90px; object-fit:cover; display:block;">
        <button onclick="borrarPizzarron(${f.id}, '${f.url_foto}')"
          style="position:absolute; top:4px; right:4px;
                 background:rgba(255,107,107,.9); color:white;
                 border:none; border-radius:4px; width:22px; height:22px;
                 cursor:pointer; font-size:13px; line-height:1;
                 display:flex; align-items:center; justify-content:center;
                 ${puedeEditar ? '' : 'opacity:0.4; pointer-events:none;'}">✕</button>
      </div>
    `).join('');

  } catch(e) {
    grid.innerHTML = '<div style="color:#ff6b6b; font-size:13px;">Error al cargar</div>';
  }
}

// ── BORRAR DEL PIZZARÓN ───────────────────────────
async function borrarPizzarron(id, url) {
  if (!puedeEditar) return;
  if (!confirm('¿Borrar esta imagen del pizzarón?')) return;

  try {
    const nombre = url.split('/').pop().split('?')[0];
    if (nombre) {
      await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_PIZ}/${nombre}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      });
    }
    await fetch(`${SUPABASE_URL}/rest/v1/pizzarron?id=eq.${id}`, {
      method: 'DELETE', headers
    });
    document.getElementById('piz-item-' + id)?.remove();
    mostrarStatusPiz('🗑️ Imagen borrada', 'ok');
  } catch(e) {
    mostrarStatusPiz('❌ Error al borrar', 'error');
  }
}