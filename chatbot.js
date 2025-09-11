// chatbot.js
const chatContainer = document.getElementById("chat");
const mensajeInput = document.getElementById("mensajeInput");
const enviarBtn = document.getElementById("enviarBtn");
const modeToggle = document.getElementById("modeToggle");

// Inicializar modo oscuro y historial al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("darkMode") === "enabled") {
    document.documentElement.classList.add("dark");
    updateModeIcon(true);
  }
  if (!window.chatHistorial) window.chatHistorial = [];
});

// Función para actualizar el ícono del modo
function updateModeIcon(isDark) {
  const icon = modeToggle.querySelector("i");
  icon.className = isDark
    ? "fas fa-sun text-xl text-gray-800 dark:text-gray-100"
    : "fas fa-moon text-xl text-gray-800 dark:text-gray-100";
}

// Permitir enviar con Enter
mensajeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") enviarMensaje(); });
enviarBtn.addEventListener("click", enviarMensaje);

// Toggle modo oscuro
modeToggle.addEventListener("click", () => {
  const isDarkMode = document.documentElement.classList.toggle("dark");
  updateModeIcon(isDarkMode);
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
});

// Función principal para enviar mensaje
function enviarMensaje() {
  const mensaje = mensajeInput.value.trim();
  if (!mensaje) return;

  const fecha = new Date().toLocaleDateString("es-CL");
  const hora = new Date().toLocaleTimeString("es-CL");

  // Mostrar mensaje del usuario
  const userWrapper = document.createElement("div");
  userWrapper.className = "flex justify-end mb-3";

  const userMessage = document.createElement("div");
  userMessage.className = "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-green-500 text-white break-words";
  userMessage.textContent = mensaje;
  if (document.documentElement.classList.contains('dark')) userMessage.classList.add('dark-mode');

  userWrapper.appendChild(userMessage);
  chatContainer.appendChild(userWrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  mensajeInput.value = "";

  // Agregar al historial
  window.chatHistorial.push({ role: "user", content: mensaje });

  // Mostrar indicador de carga
  const loadingWrapper = document.createElement("div");
  loadingWrapper.className = "flex justify-start mb-3";
  loadingWrapper.id = "loading-indicator";

  const loadingMessage = document.createElement("div");
  loadingMessage.className = "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-blue-500 text-white break-words";
  loadingMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escribiendo...';

  loadingWrapper.appendChild(loadingMessage);
  chatContainer.appendChild(loadingWrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Enviar mensaje al backend
  fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pregunta: mensaje, fecha, hora, historial: window.chatHistorial })
  })
  .then(res => res.json())
  .then(data => {
    // Remover indicador de carga
    document.getElementById("loading-indicator")?.remove();

    const respuesta = data.respuesta || "No hay respuesta disponible.";

    // Agregar respuesta al historial
    window.chatHistorial.push({ role: "assistant", content: respuesta });

    const botWrapper = document.createElement("div");
    botWrapper.className = "flex justify-start mb-3";

    const botMessage = document.createElement("div");
    botMessage.className = "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-blue-500 text-white break-words";
    botMessage.textContent = respuesta;
    if (document.documentElement.classList.contains('dark')) botMessage.classList.add('dark-mode');

    botWrapper.appendChild(botMessage);
    chatContainer.appendChild(botWrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  })
  .catch(err => {
    document.getElementById("loading-indicator")?.remove();
    console.error("Error:", err);

    const errorWrapper = document.createElement("div");
    errorWrapper.className = "flex justify-start mb-3";

    const errorMessage = document.createElement("div");
    errorMessage.className = "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-red-500 text-white break-words";
    errorMessage.textContent = "Error al conectar con el servidor.";

    if (document.documentElement.classList.contains('dark')) errorMessage.classList.add('dark-mode');

    errorWrapper.appendChild(errorMessage);
    chatContainer.appendChild(errorWrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}
