// ── PIZZARÓN — estilo Google Maps ─────────────────
const BOARD_W     = 1200;
const BOARD_H     = 800;
let escalaFotos   = 1.0;
const ESCALA_MIN  = 0.25;
const ESCALA_PASO = 0.15;
const IMG_BASE_W  = 180;
const IMG_BASE_H  = 140;
const MARGEN      = 8;

// Zoom del viewport
const ZOOM_PASOS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6];
let zoomIdx      = 7; // empieza en 1.0

// Posición de la cámara (offset del inner)
let camX = 0;
let camY = 0;

// Estado del drag
let dragging  = false;
let dragStartX = 0;
let dragStartY = 0;
let camStartX  = 0;
let camStartY  = 0;

let posiciones = [];

// ── Tamaño actual de cada foto ──
function imgW() { return Math.round(IMG_BASE_W * escalaFotos); }
function imgH() { return Math.round(IMG_BASE_H * escalaFotos); }

// ── Límites del drag para no salirse del board ──
function clampCam(x, y) {
  const z        = ZOOM_PASOS[zoomIdx];
  const vp       = document.getElementById('piz-viewport');
  const vpW      = vp ? vp.clientWidth  : 800;
  const vpH      = vp ? vp.clientHeight : 600;
  const maxX     = 0;
  const maxY     = 0;
  const minX     = Math.min(0, vpW  - BOARD_W * z);
  const minY     = Math.min(0, vpH  - BOARD_H * z);
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y))
  };
}

// ── Aplicar transform al inner ──
function aplicarCam(transition = false) {
  const inner = document.getElementById('inner');
  if (!inner) return;
  const z = ZOOM_PASOS[zoomIdx];

  if (transition) {
    inner.classList.add('zoom-transition');
    setTimeout(() => inner.classList.remove('zoom-transition'), 220);
  }

  inner.style.transform = `translate(${camX}px, ${camY}px) scale(${z})`;
  document.getElementById('zoom-label').textContent  = Math.round(z * 100) + '%';
  document.getElementById('btn-zoom-in').disabled    = zoomIdx === ZOOM_PASOS.length - 1;
  document.getElementById('btn-zoom-out').disabled   = zoomIdx === 0;
}

// ── Zoom con botones (centrado en el viewport) ──
function cambiarZoom(dir) {
  const vp   = document.getElementById('piz-viewport');
  const vpW  = vp ? vp.clientWidth  : 800;
  const vpH  = vp ? vp.clientHeight : 600;
  const zOld = ZOOM_PASOS[zoomIdx];

  zoomIdx = Math.max(0, Math.min(ZOOM_PASOS.length - 1, zoomIdx + dir));
  const zNew = ZOOM_PASOS[zoomIdx];

  // Mantener el centro del viewport anclado
  const cx = vpW / 2;
  const cy = vpH / 2;
  camX = cx - (cx - camX) * (zNew / zOld);
  camY = cy - (cy - camY) * (zNew / zOld);

  const clamped = clampCam(camX, camY);
  camX = clamped.x;
  camY = clamped.y;

  aplicarCam(true);
}

// ── Drag (mouse) ──
function initDrag() {
  const vp = document.getElementById('piz-viewport');
  if (!vp) return;

  vp.addEventListener('mousedown', e => {
    dragging   = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    camStartX  = camX;
    camStartY  = camY;
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    const clamped = clampCam(camStartX + dx, camStartY + dy);
    camX = clamped.x;
    camY = clamped.y;
    aplicarCam(false);
  });

  window.addEventListener('mouseup', () => { dragging = false; });

  // ── Drag (touch) ──
  vp.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    dragging   = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    camStartX  = camX;
    camStartY  = camY;
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (!dragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartX;
    const dy = e.touches[0].clientY - dragStartY;
    const clamped = clampCam(camStartX + dx, camStartY + dy);
    camX = clamped.x;
    camY = clamped.y;
    aplicarCam(false);
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', () => { dragging = false; });
}

// ── Encontrar posición libre ──
function encontrarPosicion() {
  const w = imgW(), h = imgH();
  for (let i = 0; i < 800; i++) {
    const x = Math.floor(Math.random() * (BOARD_W - w));
    const y = Math.floor(Math.random() * (BOARD_H - h));
    const solapa = posiciones.some(p =>
      x < p.x + p.w + MARGEN && x + w + MARGEN > p.x &&
      y < p.y + p.h + MARGEN && y + h + MARGEN > p.y
    );
    if (!solapa) return { x, y, w, h };
  }
  return null;
}

// ── Achicar y reposicionar cuando se llena ──
function achicarYReposicionar() {
  if (escalaFotos <= ESCALA_MIN) return false;
  escalaFotos = Math.max(ESCALA_MIN, escalaFotos - ESCALA_PASO);
  posiciones  = [];
  document.querySelectorAll('.pizza-foto-wrap').forEach(wrap => {
    const pos = encontrarPosicion();
    if (pos) {
      wrap.style.left   = pos.x + 'px';
      wrap.style.top    = pos.y + 'px';
      wrap.style.width  = pos.w + 'px';
      wrap.style.height = pos.h + 'px';
      posiciones.push(pos);
    }
  });
  return true;
}

// ── Insertar una foto ──
function insertarFotoPiz(url) {
  let pos = encontrarPosicion();
  if (!pos) {
    if (!achicarYReposicionar()) return;
    pos = encontrarPosicion();
    if (!pos) return;
  }
  posiciones.push(pos);

  const inner = document.getElementById('inner');
  if (!inner) return;

  const div = document.createElement('div');
  div.className     = 'pizza-foto-wrap';
  div.style.left    = pos.x + 'px';
  div.style.top     = pos.y + 'px';
  div.style.width   = pos.w + 'px';
  div.style.height  = pos.h + 'px';
  div.style.transform = `rotate(${(Math.random() * 16 - 8).toFixed(1)}deg)`;

  const img = document.createElement('img');
  img.src       = url;
  img.className = 'pizza-foto';
  img.draggable = false;
  div.appendChild(img);
  inner.appendChild(div);
}

// ── Cargar fotos desde Supabase ──
async function cargarPizzarron() {
  try {
    const res   = await fetch(
      `${SUPABASE_URL}/rest/v1/pizzarron?select=*&order=created_at.asc`,
      { headers }
    );
    const fotos = await res.json();
    fotos.forEach(f => insertarFotoPiz(f.url_foto));
    aplicarCam(false);
    initDrag();
  } catch(e) {
    console.error('Error cargando pizzarón:', e);
  }
}

cargarPizzarron();