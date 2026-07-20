// ── ESTADO ────────────────────────────────────────
let archivoActual = null;
let adminPage     = 1;
let hasNextPage   = false;

// ── ARCHIVO / PREVIEW ─────────────────────────────
function onArchivoElegido(e) {
  const file = e.target.files[0];
  if (file) mostrarPreview(file);
}

function onDrop(e) {
  e.preventDefault();
  document.getElementById('upload-box').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) mostrarPreview(file);
}

function mostrarPreview(file) {
  if (!puedeEditar) return;
  archivoActual = file;
  const reader  = new FileReader();
  reader.onload = (e) => {
    document.getElementById('preview-img').src            = e.target.result;
    document.getElementById('preview-nombre').textContent = file.name;
    document.getElementById('preview-container').style.display = 'block';
    document.getElementById('btn-subir').disabled = false;
  };
  reader.readAsDataURL(file);
}

function mostrarStatus(msg, tipo) {
  const el = document.getElementById('status-msg');
  el.textContent   = msg;
  el.className     = tipo;
  el.style.display = msg ? 'block' : 'none';
}

function limpiarForm() {
  archivoActual = null;
  document.getElementById('input-archivo').value          = '';
  document.getElementById('input-titulo').value           = '';
  document.getElementById('input-desc').value             = '';
  document.getElementById('input-es-noticia').checked     = false;
  document.getElementById('preview-container').style.display = 'none';
  document.getElementById('btn-subir').disabled           = true;
  document.getElementById('input-fecha').value            = getUruguayDate();
}

// ── SUBIR IMAGEN ──────────────────────────────────
async function subirArchivo() {
  const file   = archivoActual;
  if (!file) return null;
  const ext    = file.name.split('.').pop();
  const nombre = Date.now() + '.' + ext;

  document.getElementById('barra-container').style.display = 'block';
  document.getElementById('barra-progreso').style.width    = '30%';
  document.getElementById('barra-texto').textContent       = 'Subiendo imagen...';

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${nombre}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': file.type,
      'x-upsert': 'true'
    },
    body: file
  });

  if (!res.ok) throw new Error('Error al subir la imagen');

  document.getElementById('barra-progreso').style.width = '70%';
  document.getElementById('barra-texto').textContent    = 'Generando URL...';

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${nombre}`;
}

// ── GUARDAR PUBLICACIÓN ───────────────────────────
async function guardarPublicacion() {
  if (!puedeEditar) return;

  const titulo      = document.getElementById('input-titulo').value.trim();
  const descripcion = document.getElementById('input-desc').value.trim();
  const esNoticia   = document.getElementById('input-es-noticia').checked;
  const fecha       = getUruguayDate();
  const idfoto      = 'IMG-' + Date.now();
  let   url_foto    = null;

  if (!titulo)        { mostrarStatus('⚠️ Ingresá un título', 'error'); return; }
  if (!archivoActual) { mostrarStatus('⚠️ Seleccioná una imagen', 'error'); return; }

  try {
    url_foto = await subirArchivo();
    if (!url_foto) throw new Error('No se pudo generar la URL de la imagen');

    const res = await fetch(`${SUPABASE_URL}/rest/v1/publicacion`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ titulo, IDfoto: idfoto, descripcion: descripcion || null,
                             es_noticia: esNoticia, fecha, url_foto })
    });

    if (!res.ok) throw new Error('Error al guardar la publicación');

    mostrarStatus('✅ Publicación guardada correctamente', 'ok');
    limpiarForm();
    cargarPublicaciones(adminPage);

  } catch (err) {
    mostrarStatus('❌ ' + err.message, 'error');
  } finally {
    setTimeout(() => {
      document.getElementById('barra-container').style.display = 'none';
      document.getElementById('barra-progreso').style.width    = '0%';
    }, 800);
  }
}

// ── HELPERS DE LISTA ──────────────────────────────
function toggleDescripcion(id) {
  const descEl   = document.getElementById('admin-desc-' + id);
  const btn      = document.getElementById('admin-toggle-' + id);
  if (!descEl || !btn) return;
  const full     = descEl.dataset.full || '';
  const expanded = descEl.dataset.expanded === 'true';
  if (expanded) {
    descEl.textContent      = full.slice(0,100) + (full.length > 100 ? '...' : '');
    descEl.dataset.expanded = 'false';
    btn.textContent         = 'Ver más';
  } else {
    descEl.textContent      = full;
    descEl.dataset.expanded = 'true';
    btn.textContent         = 'Mostrar menos';
  }
}

function renderPagination(page, next) {
  const wrapper = document.getElementById('pagination-admin');
  wrapper.innerHTML = `
    <button class="pagination-button" onclick="cargarPublicaciones(${page-1})"
      ${page===1?'disabled':''}>Anterior</button>
    <span>Página ${page}</span>
    <button class="pagination-button" onclick="cargarPublicaciones(${page+1})"
      ${!next?'disabled':''}>Siguiente</button>
  `;
}

// ── CARGAR PUBLICACIONES ──────────────────────────
async function cargarPublicaciones(page = 1) {
  adminPage      = page;
  const hoy      = getUruguayDate();
  const offset   = (page-1) * PAGE_SIZE;
  const grid     = document.getElementById('publicaciones-admin');
  grid.innerHTML = '<div class="galeria-vacia">Cargando publicaciones...</div>';

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/publicacion?select=*&fecha=lte.${hoy}&order=fecha.desc,id.desc&limit=${PAGE_SIZE+1}&offset=${offset}`,
      { headers }
    );
    const publicaciones = await res.json();
    hasNextPage = publicaciones.length > PAGE_SIZE;
    if (hasNextPage) publicaciones.pop();

    if (!publicaciones.length) {
      grid.innerHTML = '<div class="galeria-vacia">No hay publicaciones disponibles</div>';
    } else {
      const borrarStyle = puedeEditar ? '' : 'opacity:0.4; cursor:not-allowed; pointer-events:none;';
      grid.innerHTML = publicaciones.map(p => `
        <div class="admin-item" id="item-${p.id}">
          <div class="admin-item-media">
            <img src="${p.url_foto || 'Imagenes/logo_fondo.png'}" alt="${escapeHtml(p.titulo || '')}">
          </div>
          <div class="admin-item-main">
            <div class="admin-item-header">
              <div>
                <div class="admin-item-title">${escapeHtml(p.titulo)}</div>
                <div class="admin-item-meta">${formatDate(p.fecha)} · ID: ${escapeHtml(p.IDfoto || '-')}</div>
              </div>
              <button class="btn-borrar" style="${borrarStyle}"
                onclick="${puedeEditar ? `borrarPublicacion(${p.id}, '${p.url_foto || ''}')` : 'mostrarAvisoSinPermiso()'}"
                title="${puedeEditar ? 'Borrar' : 'Sin permisos'}">✕</button>
            </div>
            <div class="admin-item-desc" id="admin-desc-${p.id}"
                 data-full="${escapeHtml(p.descripcion || '')}" data-expanded="false">
              ${escapeHtml((p.descripcion||'').slice(0,100))}${(p.descripcion||'').length>100?'...':''}
            </div>
            ${p.descripcion && p.descripcion.length > 100
              ? `<button class="toggle-btn" id="admin-toggle-${p.id}"
                   onclick="toggleDescripcion(${p.id})">Ver más</button>` : ''}
          </div>
        </div>
      `).join('');
    }
  } catch (e) {
    grid.innerHTML = '<div class="galeria-vacia">Error al cargar publicaciones</div>';
  }
  renderPagination(page, hasNextPage);
}

// ── BORRAR PUBLICACIÓN ────────────────────────────
async function borrarPublicacion(id, url) {
  if (!puedeEditar) { mostrarAvisoSinPermiso(); return; }
  if (!confirm('¿Borrar esta publicación?')) return;

  try {
    if (url) {
      const nombre = url.split('/').pop().split('?')[0];
      if (nombre) {
        await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${nombre}`, {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
      }
    }
    await fetch(`${SUPABASE_URL}/rest/v1/publicacion?id=eq.${id}`, {
      method: 'DELETE', headers
    });
    document.getElementById('item-' + id)?.remove();
    mostrarStatus('🗑️ Publicación borrada', 'ok');
    cargarPublicaciones(adminPage);
  } catch (e) {
    mostrarStatus('❌ Error al borrar', 'error');
  }
}