// Variables globales
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    updateDarkModeIcon();
  }
});

// Funciones UI
function showRegisterForm() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
}

function showLoginForm() {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + 'Icon');

  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye text-gray-400 hover:text-gray-600';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye-slash text-gray-400 hover:text-gray-600';
  }
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDarkMode);
  updateDarkModeIcon();
}

function updateDarkModeIcon() {
  const icon = document.getElementById('darkModeIcon');
  icon.className = isDarkMode ? 'fas fa-sun text-lg' : 'fas fa-moon text-lg';
}

// Notificaciones
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  const content = document.getElementById('notificationContent');
  const icon = document.getElementById('notificationIcon');
  const text = document.getElementById('notificationText');

  let borderColor, iconClass, iconColor;
  switch (type) {
    case 'success':
      borderColor = 'border-green-400'; iconClass = 'fas fa-check-circle'; iconColor = 'text-green-400'; break;
    case 'error':
      borderColor = 'border-red-400'; iconClass = 'fas fa-exclamation-circle'; iconColor = 'text-red-400'; break;
    case 'warning':
      borderColor = 'border-yellow-400'; iconClass = 'fas fa-exclamation-triangle'; iconColor = 'text-yellow-400'; break;
    default:
      borderColor = 'border-blue-400'; iconClass = 'fas fa-info-circle'; iconColor = 'text-blue-400';
  }

  content.className = `bg-white dark:bg-gray-800 border-l-4 ${borderColor} rounded-lg shadow-lg p-4 max-w-sm`;
  icon.innerHTML = `<i class="${iconClass} ${iconColor}"></i>`;
  text.textContent = message;
  notification.classList.remove('hidden');

  setTimeout(() => hideNotification(), 5000);
}

function hideNotification() {
  document.getElementById('notification').classList.add('hidden');
}

// Validaciones
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

// Login
document.getElementById('loginFormSubmit').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  if (!validateEmail(data.email)) { showNotification('Email inválido', 'error'); return; }
  if (!validatePassword(data.password)) { showNotification('Contraseña mínima 6 caracteres', 'error'); return; }

  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // importante para sesiones
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      showNotification(result.message, 'success');
      setTimeout(() => window.location.href = '../index.html', 1500);
    } else {
      showNotification(result.message, 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error de conexión', 'error');
  }
});

// Registro
document.getElementById('registerFormSubmit').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = {
    nombre: formData.get('nombre'),
    apellido: formData.get('apellido'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    terms: formData.get('terms') === 'on'
  };

  if (!data.nombre.trim() || !data.apellido.trim()) { showNotification('Completa todos los campos', 'error'); return; }
  if (!validateEmail(data.email)) { showNotification('Email inválido', 'error'); return; }
  if (!validatePassword(data.password)) { showNotification('Contraseña mínima 6 caracteres', 'error'); return; }
  if (data.password !== data.confirmPassword) { showNotification('Contraseñas no coinciden', 'error'); return; }
  if (!data.terms) { showNotification('Acepta los términos', 'error'); return; }

  try {
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      showNotification(result.message, 'success');
      setTimeout(() => { showLoginForm(); this.reset(); }, 1500);
    } else {
      showNotification(result.message, 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error de conexión', 'error');
  }
});