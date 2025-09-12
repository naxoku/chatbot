// chatbot.js - Funcionalidad principal del chat
const chatContainer = document.getElementById("chat");
const mensajeInput = document.getElementById("mensajeInput");
const enviarBtn = document.getElementById("enviarBtn");
const modeToggle = document.getElementById("modeToggle");

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

// Función para crear mensaje del usuario
function createUserMessage(mensaje) {
  const userWrapper = document.createElement("div");
  userWrapper.className = "flex justify-end mb-3";

  const userMessage = document.createElement("div");
  userMessage.className = "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-uct-blue text-white break-words";
  userMessage.textContent = mensaje;
  
  userWrapper.appendChild(userMessage);
  return userWrapper;
}

// Función para crear mensaje del bot con Markdown
function createBotMessage(respuesta) {
  const botWrapper = document.createElement("div");
  botWrapper.className = "flex justify-start mb-3";

  const botMessage = document.createElement("div");
  botMessage.className = "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white break-words";
  
  // Verificar si el renderizador de Markdown está disponible
  if (typeof markdownRenderer !== 'undefined' && markdownRenderer.isMarkdownAvailable()) {
    // Usar el renderizador de Markdown
    const markdownContent = markdownRenderer.createMarkdownElement(respuesta);
    
    // Transferir las clases del contenedor al contenido renderizado
    markdownContent.className = botMessage.className + ' ' + markdownContent.className;
    botWrapper.appendChild(markdownContent);
  } else {
    // Fallback: mostrar texto plano si Markdown no está disponible
    console.warn('MarkdownRenderer no está disponible, mostrando texto plano');
    botMessage.textContent = respuesta;
    botWrapper.appendChild(botMessage);
  }
  
  return botWrapper;
}

// Función para crear mensaje de error
function createErrorMessage(mensaje = "Error al conectar con el servidor.") {
  const errorWrapper = document.createElement("div");
  errorWrapper.className = "flex justify-start mb-3";

  const errorMessage = document.createElement("div");
  errorMessage.className = "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-red-500 text-white break-words";
  errorMessage.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${mensaje}`;

  errorWrapper.appendChild(errorMessage);
  return errorWrapper;
}

// Función para crear indicador de carga
function createLoadingIndicator() {
  const loadingWrapper = document.createElement("div");
  loadingWrapper.className = "flex justify-start mb-3";
  loadingWrapper.id = "loading-indicator";

  const loadingMessage = document.createElement("div");
  loadingMessage.className = "max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white break-words";
  loadingMessage.innerHTML = 'Escribiendo <i class="fas fa-spinner fa-spin mr-2"></i>';

  loadingWrapper.appendChild(loadingMessage);
  return loadingWrapper;
}

// Función para desplazar el chat hacia abajo
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Función para limpiar el indicador de carga
function removeLoadingIndicator() {
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

// Función para agregar mensaje al chat
function addMessageToChat(messageElement) {
  chatContainer.appendChild(messageElement);
  scrollToBottom();
}

// Función para limpiar el input
function clearInput() {
  mensajeInput.value = "";
}

// Función para habilitar/deshabilitar el botón de envío
function toggleSendButton(enabled) {
  enviarBtn.disabled = !enabled;
  if (enabled) {
    enviarBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    enviarBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

// Función principal para enviar mensaje
function enviarMensaje() {
  const mensaje = mensajeInput.value.trim();
  if (!mensaje) return;

  // Deshabilitar el botón de envío durante el procesamiento
  toggleSendButton(false);

  // Mostrar mensaje del usuario
  const userMessage = createUserMessage(mensaje);
  addMessageToChat(userMessage);
  clearInput();

  // Mostrar indicador de carga
  const loadingIndicator = createLoadingIndicator();
  addMessageToChat(loadingIndicator);

  // Enviar mensaje al backend
  fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pregunta: mensaje })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Remover indicador de carga
    removeLoadingIndicator();

    const respuesta = data.respuesta || "No hay respuesta disponible.";

    // Crear mensaje del bot con Markdown renderizado
    const botMessage = createBotMessage(respuesta);
    addMessageToChat(botMessage);
  })
  .catch(error => {
    removeLoadingIndicator();
    console.error("Error:", error);

    // Mostrar mensaje de error específico según el tipo de error
    let errorMessage = "Error al conectar con el servidor.";
    if (error.name === 'TypeError') {
      errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión.";
    } else if (error.message.includes('HTTP error')) {
      errorMessage = "Error del servidor. Inténtalo de nuevo más tarde.";
    }

    const errorMsg = createErrorMessage(errorMessage);
    addMessageToChat(errorMsg);
  })
  .finally(() => {
    // Rehabilitar el botón de envío
    toggleSendButton(true);
    // Enfocar de nuevo el input
    mensajeInput.focus();
  });
}

// Event Listeners
mensajeInput.addEventListener("keydown", (e) => { 
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    enviarMensaje(); 
  }
});

enviarBtn.addEventListener("click", enviarMensaje);

// Toggle modo oscuro
modeToggle.addEventListener("click", () => {
  const isDarkMode = document.documentElement.classList.toggle("dark");
  updateModeIcon(isDarkMode);
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
});

// Enfocar el input al cargar la página
window.addEventListener('load', () => {
  mensajeInput.focus();
});

// Prevenir envío de formularios vacíos
mensajeInput.addEventListener('input', () => {
  const hasContent = mensajeInput.value.trim().length > 0;
  toggleSendButton(hasContent || !enviarBtn.disabled);
});