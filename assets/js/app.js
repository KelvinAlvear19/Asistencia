// ── CONFIG ──────────────────────────────────────────────────
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdDRCVkqLvuqZDJGcL47PniLkjbpCtW_sEeV4xVEqHrnFWGhA/formResponse';

// ── RELOJ ───────────────────────────────────────────────────
const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function tick() {
  const n = new Date(), p = x => String(x).padStart(2, '0');
  document.getElementById('clockTime').textContent =
    p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds());
  document.getElementById('clockDate').textContent =
    DIAS[n.getDay()] + ', ' + n.getDate() + ' de ' + MESES[n.getMonth()] + ' ' + n.getFullYear();
}
tick();
setInterval(tick, 1000);

// ── PERFIL ──────────────────────────────────────────────────
function init() {
  const p = getCedula();
  if (!p) {
    document.getElementById('setupCard').style.display = 'block';
    document.getElementById('attCard').style.display   = 'none';
  } else {
    document.getElementById('setupCard').style.display = 'none';
    document.getElementById('attCard').style.display   = 'block';
    document.getElementById('pillCed').textContent     = p;
  }
}

function getCedula() { return localStorage.getItem('migo_cedula') || ''; }

function guardar() {
  const v   = document.getElementById('inCedula').value.trim();
  const err = document.getElementById('setupErr');
  err.style.display = 'none';
  if (!v)               { showErr(err, 'Ingresa tu cédula.'); return; }
  if (v.length < 9)     { showErr(err, 'Mínimo 9 dígitos.'); return; }
  if (!/^\d+$/.test(v)) { showErr(err, 'Solo números.'); return; }
  localStorage.setItem('migo_cedula', v);
  init();
}

function editarCedula() {
  if (!confirm('¿Cambiar la cédula guardada?')) return;
  localStorage.removeItem('migo_cedula');
  document.getElementById('inCedula').value = '';
  init();
}

// ── MARCAR ──────────────────────────────────────────────────
async function marcar(tipo) {
  const cedula = getCedula();
  const btnId  = tipo === 'entrada' ? 'btnEntrada' : 'btnSalida';
  const btn    = document.getElementById(btnId);

  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = `<span class="spinner"></span>`;

  const motivo   = (document.getElementById('motivo').value || '').trim();
  const tipoForm = tipo === 'entrada' ? 'Entrada (Inicio de Jornada)' : 'Salida (Fin de Jornada)';

  const body = new URLSearchParams({
    'entry.1357355233': cedula,
    'entry.1101738416': tipoForm,
    'entry.1624080621': motivo
  });

  try {
    await fetch(FORM_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    mostrarExito(tipo, cedula);
  } catch (e) {
    alert('Error de red. Verifica tu conexión e intenta de nuevo.');
  } finally {
    btn.disabled  = false;
    btn.innerHTML = orig;
  }
}

// ── ÉXITO ───────────────────────────────────────────────────
function mostrarExito(tipo, cedula) {
  document.getElementById('formView').style.display    = 'none';
  document.getElementById('successView').style.display = 'flex';

  const n = new Date(), p = x => String(x).padStart(2, '0');
  const hora  = p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds());
  const fecha = DIAS[n.getDay()] + ', ' + n.getDate() + ' de ' + MESES[n.getMonth()];

  const circle = document.getElementById('sucCircle');
  circle.textContent = tipo === 'entrada' ? '☀️' : '🌙';
  circle.className   = 'success-circle ' + (tipo === 'entrada' ? 'sc-entrada' : 'sc-salida');
  document.getElementById('sucTitle').textContent = tipo === 'entrada' ? '¡Buena jornada!' : '¡Hasta mañana!';
  document.getElementById('sucSub').textContent   = (tipo === 'entrada' ? 'Entrada' : 'Salida') + ' registrada · ' + cedula;
  document.getElementById('sucTime').textContent  = fecha + ' · ' + hora;
}

function volver() {
  document.getElementById('successView').style.display = 'none';
  document.getElementById('formView').style.display    = 'block';
  document.getElementById('motivo').value = '';
}

function showErr(el, msg) { el.textContent = msg; el.style.display = 'block'; }

// ── INIT ────────────────────────────────────────────────────
init();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/Asistencia/service-worker.js');
}
