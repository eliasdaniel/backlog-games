const API = '/api/juegos';
let juegos = [];
let editandoId = null;
let eliminandoId = null;
let detalleActual = null;

// ────────────── UTILIDADES ──────────────

function toast(msg, tipo = 'success') {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    document.getElementById('toastIcon').textContent = tipo === 'success' ? '✅' : '❌';
    t.className = `toast ${tipo} show`;
    setTimeout(() => t.classList.remove('show'), 3000);
}

function estadoBadge(estado) {
    const map = {
        Pendiente: 'pendiente',
        Jugando: 'jugando',
        Completado: 'completado',
        Abandonado: 'abandonado'
    };
    return `<span class="badge badge-${map[estado]}">${estado}</span>`;
}

function fmtCal(c) {
    return c !== null && c !== undefined ? `⭐ ${c}` : '—';
}

// ────────────── CARGAR DATOS ──────────────

async function cargar(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API}?${qs}`);
    const data = await res.json();
    juegos = data.juegos;
    renderStats(data.stats);
    renderGrid(juegos);
}

function renderStats(s) {
    document.getElementById('statTotal').textContent = s.total;
    const estado = {};
    s.porEstado.forEach(e => estado[e._id] = e.count);
    document.getElementById('statJugando').textContent = estado['Jugando'] || 0;
    document.getElementById('statCompletado').textContent = estado['Completado'] || 0;
    document.getElementById('statPendiente').textContent = estado['Pendiente'] || 0;
    document.getElementById('statPromedio').textContent = s.promedio ? `${s.promedio}/10` : '—';
}

function renderGrid(lista) {
    const grid = document.getElementById('grid');
    if (!lista.length) {
        grid.innerHTML = `
    <div class="empty">
        <div class="empty-icon">🕹️</div>
        <h3>Sin juegos por aquí</h3>
        <p>Agrega tu primer juego al backlog</p>
    </div>`;
        return;
    }
    grid.innerHTML = lista.map(j => `
    <div class="card" onclick="verDetalle('${j._id}')">
    <div class="card-header">
        <span class="card-titulo">${j.titulo}</span>
        ${estadoBadge(j.estado)}
    </div>
    <div class="card-meta">
        <span class="tag">🎮 ${j.plataforma}</span>
        <span class="tag">🏷️ ${j.genero}</span>
    </div>
    ${j.calificacion !== null ? `<div class="card-calificacion">${fmtCal(j.calificacion)}/10</div>` : ''}
    ${j.notas ? `<p class="card-notas">${j.notas}</p>` : ''}
    <div class="card-actions" onclick="event.stopPropagation()">
        <button class="btn-icon" onclick="abrirEditar('${j._id}')" title="Editar">✏️</button>
        <button class="btn-icon delete" onclick="pedirConfirmar('${j._id}','${j.titulo.replace(/'/g, "\\'")}')" title="Eliminar">🗑️</button>
    </div>
    </div>
`).join('');
}

// ────────────── FILTROS ──────────────

function filtrar() {
    const busqueda = document.getElementById('busqueda').value.trim();
    const estado = document.getElementById('filtroEstado').value;
    const genero = document.getElementById('filtroGenero').value;
    cargar({ busqueda, estado, genero });
}

// ────────────── FORMULARIO ──────────────

function abrirFormulario(juego = null) {
    editandoId = juego ? juego._id : null;
    document.getElementById('formTitulo').textContent = juego ? 'EDITAR JUEGO' : 'NUEVO JUEGO';
    document.getElementById('fTitulo').value = juego?.titulo || '';
    document.getElementById('fGenero').value = juego?.genero || '';
    document.getElementById('fPlataforma').value = juego?.plataforma || '';
    document.getElementById('fEstado').value = juego?.estado || 'Pendiente';
    document.getElementById('fCalificacion').value = juego?.calificacion ?? '';
    document.getElementById('fNotas').value = juego?.notas || '';
    document.getElementById('overlayForm').classList.add('active');
}

function cerrarForm() {
    document.getElementById('overlayForm').classList.remove('active');
    editandoId = null;
}

async function guardarJuego() {
    const titulo = document.getElementById('fTitulo').value.trim();
    const genero = document.getElementById('fGenero').value;
    const plataforma = document.getElementById('fPlataforma').value;
    const estado = document.getElementById('fEstado').value;
    const calStr = document.getElementById('fCalificacion').value;
    const notas = document.getElementById('fNotas').value.trim();

    if (!titulo || titulo.length < 2) return toast('El título debe tener al menos 2 caracteres.', 'error');
    if (!genero) return toast('Selecciona un género.', 'error');
    if (!plataforma) return toast('Selecciona una plataforma.', 'error');

    const body = {
        titulo, genero, plataforma, estado, notas,
        calificacion: calStr !== '' ? parseFloat(calStr) : null
    };

    const url = editandoId ? `${API}/${editandoId}` : API;
    const method = editandoId ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) return toast(data.error || 'Error al guardar.', 'error');

    toast(editandoId ? 'Juego actualizado ✔' : '¡Juego agregado al backlog!');
    cerrarForm();
    cargar();
}

// ────────────── EDITAR ──────────────

function abrirEditar(id) {
    const j = juegos.find(x => x._id === id);
    if (j) abrirFormulario(j);
}

function editarDesdeDetalle() {
    cerrarDetalle();
    if (detalleActual) abrirFormulario(detalleActual);
}

// ────────────── DETALLE ──────────────

async function verDetalle(id) {
    const res = await fetch(`${API}/${id}`);
    const j = await res.json();
    detalleActual = j;
    document.getElementById('detalleContenido').innerHTML = `
    <div class="detail-titulo">${j.titulo}</div>
    <div style="margin-bottom:.75rem">${estadoBadge(j.estado)}</div>
    <div class="detail-row">
    <div class="detail-item">
        <span class="detail-label">Plataforma</span>
        <span class="detail-value">🎮 ${j.plataforma}</span>
    </div>
    <div class="detail-item">
        <span class="detail-label">Género</span>
        <span class="detail-value">🏷️ ${j.genero}</span>
    </div>
    <div class="detail-item">
        <span class="detail-label">Calificación</span>
        <span class="detail-value">${fmtCal(j.calificacion)}</span>
    </div>
    </div>
    ${j.notas
            ? `<div class="detail-notas">${j.notas}</div>`
            : '<p style="color:var(--muted);font-size:.85rem">Sin notas.</p>'
        }`;
    document.getElementById('overlayDetalle').classList.add('active');
}

function cerrarDetalle() {
    document.getElementById('overlayDetalle').classList.remove('active');
    detalleActual = null;
}

// ────────────── ELIMINAR ──────────────

function pedirConfirmar(id, nombre) {
    eliminandoId = id;
    document.getElementById('confirmNombre').textContent = nombre;
    document.getElementById('overlayConfirm').classList.add('active');
}

function cerrarConfirm() {
    document.getElementById('overlayConfirm').classList.remove('active');
    eliminandoId = null;
}

async function confirmarEliminar() {
    const res = await fetch(`${API}/${eliminandoId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return toast(data.error || 'Error al eliminar.', 'error');
    toast('Juego eliminado del backlog.');
    cerrarConfirm();
    cargar();
}

// ────────────── CERRAR OVERLAY AL CLICK FUERA ──────────────
['overlayForm', 'overlayDetalle', 'overlayConfirm'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
        if (e.target.id === id) {
            if (id === 'overlayForm') cerrarForm();
            if (id === 'overlayDetalle') cerrarDetalle();
            if (id === 'overlayConfirm') cerrarConfirm();
        }
    });
});


cargar();