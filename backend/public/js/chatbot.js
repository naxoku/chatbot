// chatbot.js - Funcionalidad principal del chat
const chatContainer = document.getElementById("chat");
const mensajeInput = document.getElementById("mensajeInput");
const enviarBtn = document.getElementById("enviarBtn");
const modeToggle = document.getElementById("modeToggle");
const generarMapaBtn = document.getElementById("generarMapaBtn");

// ================== FUNCIONES BASE ==================

// Inicializar modo oscuro al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("darkMode") === "enabled") {
    document.documentElement.classList.add("dark");
    updateModeIcon(true);
  }
});

// Función para actualizar el ícono del modo
function updateModeIcon(isDark) {
  const icon = modeToggle.querySelector("i");
  icon.className = isDark
    ? "fas fa-sun text-xl text-gray-800 dark:text-gray-100"
    : "fas fa-moon text-xl text-gray-800 dark:text-gray-100";
}

// Crear mensaje del usuario
function createUserMessage(mensaje) {
  const userWrapper = document.createElement("div");
  userWrapper.className = "flex justify-end mb-3";

  const userMessage = document.createElement("div");
  userMessage.className =
    "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-uct-blue text-white break-words";
  userMessage.textContent = mensaje;

  userWrapper.appendChild(userMessage);
  return userWrapper;
}

// Crear mensaje del bot con Markdown
function createBotMessage(respuesta) {
  const botWrapper = document.createElement("div");
  botWrapper.className = "flex justify-start mb-3";

  const botMessage = document.createElement("div");
  botMessage.className =
    "message from-bot max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white break-words";

  if (
    typeof markdownRenderer !== "undefined" &&
    markdownRenderer.isMarkdownAvailable()
  ) {
    const markdownContent = markdownRenderer.createMarkdownElement(respuesta);
    markdownContent.className =
      botMessage.className + " " + markdownContent.className;
    markdownContent.classList.add("message-content");
    botWrapper.appendChild(markdownContent);
  } else {
    console.warn("MarkdownRenderer no disponible, mostrando texto plano");
    botMessage.textContent = respuesta;
    botWrapper.appendChild(botMessage);
  }

  return botWrapper;
}

// Crear mensaje de error
function createErrorMessage(mensaje = "Error al conectar con el servidor.") {
  const errorWrapper = document.createElement("div");
  errorWrapper.className = "flex justify-start mb-3";

  const errorMessage = document.createElement("div");
  errorMessage.className =
    "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-red-500 text-white break-words";
  errorMessage.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${mensaje}`;

  errorWrapper.appendChild(errorMessage);
  return errorWrapper;
}

// Crear indicador de carga
function createLoadingIndicator() {
  const loadingWrapper = document.createElement("div");
  loadingWrapper.className = "flex justify-start mb-3";
  loadingWrapper.id = "loading-indicator";

  const loadingMessage = document.createElement("div");
  loadingMessage.className =
    "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white break-words";
  loadingMessage.innerHTML =
    'Escribiendo <i class="fas fa-spinner fa-spin mr-2"></i>';

  loadingWrapper.appendChild(loadingMessage);
  return loadingWrapper;
}

// Desplazar el chat hacia abajo
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Limpiar el indicador de carga
function removeLoadingIndicator() {
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) loadingIndicator.remove();
}

// Agregar mensaje al chat
function addMessageToChat(messageElement) {
  chatContainer.appendChild(messageElement);
  scrollToBottom();
}

// Limpiar el input
function clearInput() {
  mensajeInput.value = "";
}

// Habilitar/deshabilitar el botón de envío
function toggleSendButton(enabled) {
  enviarBtn.disabled = !enabled;
  if (enabled) {
    enviarBtn.classList.remove("opacity-50", "cursor-not-allowed");
  } else {
    enviarBtn.classList.add("opacity-50", "cursor-not-allowed");
  }
}

// ================== MENSAJERÍA ==================

function enviarMensaje() {
  const mensaje = mensajeInput.value.trim();
  if (!mensaje) return;

  toggleSendButton(false);

  // Usuario
  const userMessage = createUserMessage(mensaje);
  addMessageToChat(userMessage);
  clearInput();

  // Loading
  const loadingIndicator = createLoadingIndicator();
  addMessageToChat(loadingIndicator);

  // Backend
  fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pregunta: mensaje }),
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      removeLoadingIndicator();

      const respuesta = data.respuesta || "No hay respuesta disponible.";
      const botMessage = createBotMessage(respuesta);
      addMessageToChat(botMessage);
    })
    .catch((error) => {
      removeLoadingIndicator();
      console.error("Error:", error);

      let errorMessage = "Error al conectar con el servidor.";
      if (error.name === "TypeError") {
        errorMessage =
          "No se pudo conectar con el servidor. Verifica tu conexión.";
      } else if (error.message.includes("HTTP error")) {
        errorMessage = "Error del servidor. Inténtalo de nuevo más tarde.";
      }

      const errorMsg = createErrorMessage(errorMessage);
      addMessageToChat(errorMsg);
    })
    .finally(() => {
      toggleSendButton(true);
      mensajeInput.focus();
    });
}

// ================== MAPA MENTAL ==================
generarMapaBtn.addEventListener("click", async () => {
  const mensajesDelBot = document.querySelectorAll(".message.from-bot");
  if (mensajesDelBot.length === 0) {
    alert("No hay mensajes del bot para generar un mapa mental.");
    return;
  }

  const ultimoMensaje = mensajesDelBot[mensajesDelBot.length - 1].querySelector(
    ".message-content"
  )
    ? mensajesDelBot[mensajesDelBot.length - 1].querySelector(
        ".message-content"
      ).textContent
    : mensajesDelBot[mensajesDelBot.length - 1].textContent;

  generarMapaBtn.disabled = true;
  generarMapaBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Cargando...';

  try {
    const response = await fetch(
      "http://localhost:3000/api/generar-mapa-mental",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contexto: ultimoMensaje }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "No se pudo generar el mapa mental.");
    }

    const jsonData = await response.json();

    // 1. Crear un contenedor para el mapa D3
    const botWrapper = document.createElement("div");
    botWrapper.className = "flex justify-start mb-3 w-full";

    const mapContainer = document.createElement("div");

    // 2. Darle un ID único para que D3 sepa dónde dibujar
    const containerId = "map-" + Date.now();
    mapContainer.id = containerId;
    mapContainer.className = "w-full rounded-lg p-2 overflow-auto";

    botWrapper.appendChild(mapContainer);
    addMessageToChat(botWrapper);

    // 3. Llamar a la función de renderizado de D3
    if (typeof renderMindMap === "function") {
      renderMindMap(jsonData, `#${containerId}`);
    } else {
      throw new Error("La función renderMindMap no está definida.");
    }

    scrollToBottom();
  } catch (error) {
    console.error("Error al generar el mapa mental:", error);
    const errorMsg = createErrorMessage(
      `Error al generar el mapa: ${error.message}`
    );
    addMessageToChat(errorMsg);
  } finally {
    generarMapaBtn.disabled = false;
    generarMapaBtn.innerHTML =
      '<i class="fas fa-brain"></i> Generar Mapa Mental';
  }
});

// ================== EVENT LISTENERS ==================

mensajeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    enviarMensaje();
  }
});

enviarBtn.addEventListener("click", enviarMensaje);

modeToggle.addEventListener("click", () => {
  const isDarkMode = document.documentElement.classList.toggle("dark");
  updateModeIcon(isDarkMode);
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
});

window.addEventListener("load", () => {
  mensajeInput.focus();
});

mensajeInput.addEventListener("input", () => {
  const hasContent = mensajeInput.value.trim().length > 0;
  toggleSendButton(hasContent || !enviarBtn.disabled);
});
