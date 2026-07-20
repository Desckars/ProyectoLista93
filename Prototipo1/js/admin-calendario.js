// ── CALENDARIO ────────────────────────────────────
async function cargarCalendario() {
  try {
    const res  = await fetch(`${SUPABASE_URL}/rest/v1/calendario?id=eq.1&select=link`, { headers });
    const data = await res.json();
    if (data.length && data[0].link)
      document.getElementById('input-calendario').value = data[0].link;
  } catch (e) {
    console.error('Error cargando calendario:', e);
  }
}

async function guardarCalendario() {
  if (!puedeEditar) { mostrarAvisoSinPermiso(); return; }
  const link = document.getElementById('input-calendario').value.trim();
  if (!link || !/^(https:\/\/calendar\.google\.com|https:\/\/www\.google\.com\/calendar)/.test(link)) {
    mostrarStatusCal('⚠️ Pegá un link válido de Google Calendar', 'error');
    return;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/calendario?id=eq.1`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ link })
    });
    if (!res.ok) throw new Error('Error al guardar');
    mostrarStatusCal('✅ Link guardado correctamente', 'ok');
  } catch (e) {
    mostrarStatusCal('❌ Error al guardar el link', 'error');
  }
}

function mostrarStatusCal(msg, tipo) {
  const el = document.getElementById('status-calendario');
  el.textContent      = msg;
  el.style.display    = 'block';
  el.style.background = tipo === 'ok' ? '#1a3a2a' : '#3a1a1a';
  el.style.color      = tipo === 'ok' ? '#4ade80' : '#ff6b6b';
  setTimeout(() => el.style.display = 'none', 3000);
}