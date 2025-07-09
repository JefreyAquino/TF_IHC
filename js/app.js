// === VARIABLES GLOBALES ===
let chartTareas = null;

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  window.location.href = "index.html";
} else {
  document.getElementById("welcome").textContent = `Hola, ${usuario.nombre} (${usuario.rol})`;
}

// === UTILIDADES ===
function mostrar(id) {
  document.querySelectorAll(".panel-section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id)?.classList.remove("hidden");
}

function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

function ocultarSeccion(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function ocultarBoton(nombre) {
  const botones = Array.from(document.querySelectorAll("nav button"));
  const boton = botones.find(btn => btn.textContent.trim() === nombre);
  if (boton) boton.style.display = "none";
}

// === PERFIL ===
const inputNombre = document.getElementById("nuevo-nombre");
const inputFoto = document.getElementById("foto-perfil");
const inputEmail = document.getElementById("email-usuario");
const inputTelefono = document.getElementById("telefono-usuario");
const inputFechaNac = document.getElementById("fecha-nacimiento");

const previewFoto = document.getElementById("preview-foto");
const spanNombreActual = document.getElementById("nombre-actual");
const spanRolActual = document.getElementById("rol-actual");
const msgPerfil = document.getElementById("msg-perfil");

if (usuario?.foto) {
  previewFoto.src = usuario.foto;
  previewFoto.style.display = "block";
}
inputNombre.value = usuario.nombre || "";
inputEmail.value = usuario.email || "";
inputTelefono.value = usuario.telefono || "";
inputFechaNac.value = usuario.fechaNacimiento || "";

spanNombreActual.textContent = usuario.nombre || "";
spanRolActual.textContent = usuario.rol || "";

document.getElementById("perfil-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  usuario.nombre = inputNombre.value;
  usuario.email = inputEmail.value;
  usuario.telefono = inputTelefono.value;
  usuario.fechaNacimiento = inputFechaNac.value;

  const archivo = inputFoto.files[0];
  if (archivo) {
    const reader = new FileReader();
    reader.onload = function (event) {
      usuario.foto = event.target.result;
      guardarPerfil();
    };
    reader.readAsDataURL(archivo);
  } else {
    guardarPerfil();
  }
});

function guardarPerfil() {
  localStorage.setItem("usuario", JSON.stringify(usuario));
  document.getElementById("welcome").textContent = `Hola, ${usuario.nombre} (${usuario.rol})`;
  previewFoto.src = usuario.foto;
  previewFoto.style.display = "block";
  spanNombreActual.textContent = usuario.nombre;
  msgPerfil.textContent = "✅ Perfil actualizado correctamente";
  setTimeout(() => msgPerfil.textContent = "", 3000);
}
// === TAREAS ===
let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

const listaTareas = document.getElementById("lista-tareas");
const formTarea = document.getElementById("form-tarea");
const inputTarea = document.getElementById("nueva-tarea");
const contador = document.getElementById("contador-tareas");
const mensajeVacio = document.getElementById("mensaje-vacio");

function renderTareas() {
  listaTareas.innerHTML = "";

  if (tareas.length === 0) {
    mensajeVacio.textContent = "No hay tareas pendientes. ¡Bien hecho! 🎉";
    contador.textContent = "0 completadas / 0 totales";
    actualizarGraficoTareas();
    return;
  } else {
    mensajeVacio.textContent = "";
  }

  let completadas = 0;

  tareas.forEach((tarea, i) => {
    const li = document.createElement("li");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = tarea.completado;
    check.onchange = () => {
      tarea.completado = check.checked;
      guardarTareas();
      renderTareas();
    };

    const texto = document.createElement("span");
    texto.textContent = tarea.texto;
    texto.contentEditable = true;
    texto.onblur = () => {
      tarea.texto = texto.textContent;
      guardarTareas();
    };

    const borrar = document.createElement("button");
    borrar.textContent = "🗑️";
    borrar.onclick = () => {
      tareas.splice(i, 1);
      guardarTareas();
      renderTareas();
    };

    li.appendChild(check);
    li.appendChild(texto);
    li.appendChild(borrar);
    listaTareas.appendChild(li);

    if (tarea.completado) completadas++;
  });

  contador.textContent = `${completadas} completadas / ${tareas.length} totales`;
  actualizarGraficoTareas();
}

function guardarTareas() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

function actualizarGraficoTareas() {
  const completadas = tareas.filter(t => t.completado).length;
  const pendientes = tareas.length - completadas;

  if (chartTareas) chartTareas.destroy();

  if (document.getElementById("graficoTareas")) {
    chartTareas = new Chart(document.getElementById("graficoTareas"), {
      type: 'doughnut',
      data: {
        labels: ['Completadas', 'Pendientes'],
        datasets: [{
          data: [completadas, pendientes],
          backgroundColor: ['#4CAF50', '#f44336']
        }]
      }
    });

    document.getElementById("resumen-tareas").textContent =
      `Tareas completadas: ${completadas} / ${tareas.length}`;
  }
}

formTarea?.addEventListener("submit", function (e) {
  e.preventDefault();
  const texto = inputTarea.value.trim();
  if (texto) {
    tareas.push({ texto, completado: false });
    guardarTareas();
    renderTareas();
    inputTarea.value = "";
  }
});

// 🔔 Recordatorio
setTimeout(() => {
  const pendientes = tareas.filter(t => !t.completado);
  if (pendientes.length > 0) {
    alert("🔔 ¡No olvides completar tus tareas pendientes!");
  }
}, 10000);

renderTareas();
// === CALENDARIO ===
let eventos = JSON.parse(localStorage.getItem("eventos")) || [];

const listaEventos = document.getElementById("lista-eventos");
const formEvento = document.getElementById("form-evento");
const proximoEvento = document.getElementById("proximo-evento");
const nombreUsuario = document.getElementById("nombre-usuario");

if (nombreUsuario) nombreUsuario.textContent = usuario.nombre;

function formatearFecha(fecha) {
  const [a, m, d] = fecha.split("-");
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                 "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${d} ${meses[parseInt(m) - 1]}`;
}

function renderEventos() {
  listaEventos.innerHTML = "";

  if (eventos.length === 0) {
    listaEventos.innerHTML = "<li style='color:gray;'>No hay eventos programados.</li>";
    proximoEvento.textContent = "";
    return;
  }

  eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const proximo = eventos[0];
  proximoEvento.textContent = `🔔 Próximo evento: ${formatearFecha(proximo.fecha)} – ${proximo.desc}`;

  eventos.forEach((e, i) => {
    const li = document.createElement("li");

    const eliminarBtn = document.createElement("button");
    eliminarBtn.textContent = "🗑️";
    eliminarBtn.style.marginLeft = "10px";
    eliminarBtn.onclick = () => {
      if (confirm("¿Eliminar este evento?")) {
        eventos.splice(i, 1);
        localStorage.setItem("eventos", JSON.stringify(eventos));
        renderEventos();
        cargarIndicadores(); // opcional si usas gráfico de visitas
      }
    };

    li.innerHTML = `📍 <strong>${formatearFecha(e.fecha)}:</strong> ${e.desc}`;
    li.appendChild(eliminarBtn);
    listaEventos.appendChild(li);
  });
}

formEvento?.addEventListener("submit", function (e) {
  e.preventDefault();
  const fecha = document.getElementById("fecha-evento").value;
  const desc = document.getElementById("descripcion-evento").value;
  if (!fecha || !desc) return;

  eventos.push({ fecha, desc });
  localStorage.setItem("eventos", JSON.stringify(eventos));
  renderEventos();
  cargarIndicadores();
  this.reset();
});

renderEventos();

// === ACUERDOS ===
let acuerdos = JSON.parse(localStorage.getItem("acuerdos")) || [];

const listaAcuerdos = document.getElementById("lista-acuerdos");
const formAcuerdo = document.getElementById("form-acuerdo");
const inputTexto = document.getElementById("nuevo-acuerdo");
const inputTipo = document.getElementById("tipo-acuerdo");
const inputResponsable = document.getElementById("responsable-acuerdo");
const inputFecha = document.getElementById("fecha-acuerdo");
const msgAcuerdo = document.getElementById("msg-acuerdo");

function renderAcuerdos() {
  listaAcuerdos.innerHTML = "";

  if (acuerdos.length === 0) {
    listaAcuerdos.innerHTML = "<li style='color:gray;'>No hay acuerdos registrados aún.</li>";
    return;
  }

  acuerdos.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${a.tipo}:</strong> ${a.texto} <br/>
      <small>🗓️ ${formatearFecha(a.fecha)} | Responsable: ${a.responsable}</small>
    `;
    listaAcuerdos.appendChild(li);
  });
}

formAcuerdo?.addEventListener("submit", function (e) {
  e.preventDefault();
  const nuevo = {
    texto: inputTexto.value,
    tipo: inputTipo.value,
    responsable: inputResponsable.value,
    fecha: inputFecha.value
  };

  acuerdos.push(nuevo);
  localStorage.setItem("acuerdos", JSON.stringify(acuerdos));
  renderAcuerdos();
  this.reset();
  msgAcuerdo.textContent = "✅ Acuerdo agregado correctamente";
  setTimeout(() => msgAcuerdo.textContent = "", 3000);
});

renderAcuerdos();
// === GASTOS ===
let gastos = JSON.parse(localStorage.getItem("gastos")) || [];

const listaGastos = document.getElementById("lista-gastos");
const totalGastosSpan = document.getElementById("total-gastos");

function renderGastos() {
  listaGastos.innerHTML = "";
  let total = 0;

  gastos.forEach((g) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${g.quien}:</strong> S/ ${g.monto.toFixed(2)} - ${g.detalle}`;
    listaGastos.appendChild(li);
    total += g.monto;
  });

  totalGastosSpan.textContent = total.toFixed(2);
}

document.getElementById("form-gasto")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const quien = document.getElementById("quien").value;
  const monto = parseFloat(document.getElementById("monto").value);
  const detalle = document.getElementById("detalle").value;

  if (!quien || isNaN(monto) || !detalle) return;

  const nuevo = { quien, monto, detalle };
  gastos.push(nuevo);
  localStorage.setItem("gastos", JSON.stringify(gastos));

  renderGastos();
  cargarIndicadores();
  this.reset();
});

renderGastos();

// === INDICADORES ===
function cargarIndicadores() {
  // Tareas → ya se actualiza desde renderTareas()

  // Visitas
  const visitas = eventos.filter(e => e.desc.toLowerCase().includes("visita")).length;
  if (document.getElementById("graficoVisitas")) {
    new Chart(document.getElementById("graficoVisitas"), {
      type: 'bar',
      data: {
        labels: ['Este mes'],
        datasets: [{
          label: 'Visitas',
          data: [visitas],
          backgroundColor: '#4D6EC5'
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });

    document.getElementById("resumen-visitas").textContent =
      `Visitas registradas: ${visitas}`;
  }

  // Gastos
  if (document.getElementById("graficoGastos")) {
    const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);

    new Chart(document.getElementById("graficoGastos"), {
      type: 'pie',
      data: {
        labels: ['Gastos registrados'],
        datasets: [{
          data: [totalGastos],
          backgroundColor: ['#FF9800']
        }]
      }
    });

    document.getElementById("resumen-gastos").textContent =
      `Total de gastos: S/ ${totalGastos.toFixed(2)}`;
  }
}
// === HIJOS ===
let hijos = JSON.parse(localStorage.getItem("hijos")) || [];
const listaHijos = document.getElementById("lista-hijos");

document.getElementById("form-hijo")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre-hijo").value;
  const edad = parseInt(document.getElementById("edad-hijo").value);
  const rol = document.getElementById("rol-hijo").value;

  hijos.push({ nombre, edad, rol });
  localStorage.setItem("hijos", JSON.stringify(hijos));
  renderHijos();
  this.reset();
});

function renderHijos() {
  const tbody = document.getElementById("lista-hijos");
  tbody.innerHTML = "";

  if (hijos.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:gray;'>No hay hijos registrados</td></tr>";
    return;
  }

  hijos.forEach((hijo, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${hijo.nombre}</td>
      <td>${hijo.edad}</td>
      <td>${hijo.rol}</td>
      <td><button onclick="eliminarHijo(${index})">🗑️ Quitar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

renderHijos();

function eliminarHijo(index) {
  if (confirm("¿Estás seguro de que deseas eliminar a este hijo/a?")) {
    hijos.splice(index, 1);
    localStorage.setItem("hijos", JSON.stringify(hijos));
    renderHijos();
  }
}



// === PRIVACIDAD ===
document.getElementById("form-privacidad")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const config = {
    mostrarTareas: document.getElementById("mostrar-tareas-hijo").checked,
    mostrarGastos: document.getElementById("mostrar-gastos-hijo").checked,
    mostrarAcuerdos: document.getElementById("mostrar-acuerdos-hijo").checked
  };

  localStorage.setItem("privacidad", JSON.stringify(config));
  document.getElementById("msg-privacidad").textContent = "✅ Configuración guardada correctamente";

  setTimeout(() => {
    document.getElementById("msg-privacidad").textContent = "";
  }, 3000);
});

// === MENSAJES ===
let mensajes = JSON.parse(localStorage.getItem("mensajes")) || [];
const chatBox = document.getElementById("chat-mensajes");
const chatForm = document.getElementById("chat-form");
const inputMensaje = document.getElementById("mensaje");


function renderMensajes() {
  if (!chatBox) return;
  chatBox.innerHTML = "";

  mensajes.forEach(m => {
    const div = document.createElement("div");
    div.style.marginBottom = "0.5rem";
    div.style.padding = "0.5rem";
    div.style.borderRadius = "6px";
    div.style.backgroundColor = m.rol === "padre" ? "#e0f7fa" : "#fff3e0";
    div.innerHTML = `<strong>${m.autor}:</strong> ${m.texto}`;
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}



chatForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const texto = inputMensaje.value.trim();
  if (!texto) return;

  const nuevo = {
    autor: usuario.nombre,
    rol: usuario.rol,
    texto
  };

  mensajes.push(nuevo);
  localStorage.setItem("mensajes", JSON.stringify(mensajes));
  inputMensaje.value = "";
  renderMensajes();
});


// === GUÍA SEGÚN ROL ===
function cargarGuiaPorRol() {
  const contenedor = document.getElementById("guia-contenido");
  if (!contenedor) return;

  if (usuario.rol === "padre" || usuario.rol === "madre") {
    contenedor.innerHTML = `
      <p>👋 Bienvenido/a, <strong>${usuario.nombre}</strong>. Esta es tu guía para aprovechar DiviTime como padre/madre:</p>
      <ol style="margin-top: 1rem;">
        <li>📅 <strong>Calendario:</strong> Agrega y organiza eventos importantes (visitas, reuniones, cumpleaños, etc.).</li>
        <li>🗒️ <strong>Tareas:</strong> Asigna tareas a tus hijos, y visualiza su progreso.</li>
        <li>📜 <strong>Acuerdos:</strong> Define y registra reglas familiares claras.</li>
        <li>💰 <strong>Gastos:</strong> Lleva un control de los gastos relacionados a tus hijos.</li>
        <li>🔒 <strong>Privacidad:</strong> Decide qué secciones puede ver tu hijo/a desde su cuenta.</li>
        <li>👨‍👧 <strong>Mis Hijos:</strong> Registra y administra información de tus hijos/as.</li>
        <li>💬 <strong>Mensajes:</strong> Envíales comunicados importantes y guarda historial.</li>
        <li>📊 <strong>Indicadores:</strong> Revisa en gráficos el progreso familiar.</li>
        <li>🖼️ <strong>Perfil:</strong> Personaliza tu nombre, foto y datos personales.</li>
        <li>📤 <strong>Salir:</strong> Cierra sesión de forma segura al finalizar.</li>
      </ol>
      <p style="margin-top: 1rem; color: #555;">🔁 Puedes volver aquí en cualquier momento desde el menú lateral.</p>
    `;
  } else {
    contenedor.innerHTML = `
      <p>👋 Hola <strong>${usuario.nombre}</strong>. Esta es tu guía para usar DiviTime como hijo/a:</p>
      <ol style="margin-top: 1rem;">
        <li>📅 <strong>Calendario:</strong> Mira cuándo hay eventos familiares importantes.</li>
        <li>🗒️ <strong>Tareas:</strong> Revisa lo que te toca hacer y márcalas como completadas.</li>
        <li>📜 <strong>Acuerdos:</strong> Consulta las reglas familiares acordadas.</li>
        <li>💬 <strong>Mensajes:</strong> Lee lo que tus padres han compartido contigo.</li>
        <li>📊 <strong>Indicadores:</strong> Revisa cómo vas en tus tareas y actividades.</li>
        <li>👤 <strong>Perfil:</strong> Puedes ver tus datos personales.</li>
        <li>📤 <strong>Salir:</strong> Cierra sesión cuando termines.</li>
      </ol>
      <p style="margin-top: 1rem; color: #666;">🔒 Algunas secciones podrían no estar disponibles si tus padres las han ocultado.</p>
    `;
  }
}

// === CONFIGURACIÓN FINAL POR ROL ===
document.addEventListener("DOMContentLoaded", () => {
  mostrar("calendario");

  // Cargar configuración de privacidad
  const config = JSON.parse(localStorage.getItem("privacidad")) || {
    mostrarTareas: true,
    mostrarGastos: false,
    mostrarAcuerdos: true
  };

  if (usuario.rol === "hijo") {
    // Siempre ocultar formularios
    ocultarSeccion("form-evento");
    ocultarSeccion("form-tarea");
    ocultarSeccion("form-gasto");
    ocultarSeccion("form-acuerdo");
    ocultarSeccion("perfil-form");
    ocultarSeccion("form-hijo");
    ocultarSeccion("form-privacidad");
    ocultarSeccion("chat-form");

    ocultarBoton("Mis Hijos");
    ocultarBoton("Privacidad");
    ocultarBoton("Perfil");

    // Aplicar configuración de privacidad
    if (!config.mostrarTareas) {
      ocultarBoton("Tareas");
      ocultarSeccion("tareas");
    }

    if (!config.mostrarGastos) {
      ocultarBoton("Gastos");
      ocultarSeccion("gastos");
    }

    if (!config.mostrarAcuerdos) {
      ocultarBoton("Acuerdos");
      ocultarSeccion("acuerdos");
    }
  }

  // Cargar el resto
  renderTareas();
  renderEventos();
  renderAcuerdos();
  renderGastos();
  renderHijos();
  renderMensajes();
  cargarGuiaPorRol();
  cargarIndicadores();
});
