document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const tokenInput = document.getElementById('bearerToken');
    const copyTokenBtn = document.getElementById('copyTokenBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const verifyTokenBtn = document.getElementById('verifyTokenBtn');

    // Configuración de la API
    const API_BASE_URL = 'https://localhost:3000/auth';
    const HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    verifyTokenBtn.addEventListener('click', async () => {
        await verifyToken();
    });

    async function verifyToken() {
        clearMessages();
        loading.style.display = 'block';
        verifyTokenBtn.disabled = true;

        try {
            const token = tokenInput.value;

            if (!token) {
                throw new Error('No hay token para verificar');
            }

            const response = await fetch('https://localhost:3000/private/dashboard', {
                method: 'GET',
                headers: {
                    'auth-token': token
                }
            });

            const data = await response.json();

            if (response.status === 401) {
                throw new Error(data.message || 'Error de verificación');
            }

            showTempMessage('Token válido! Acceso concedido', 'success');

        } catch (error) {
            showError(error.message);
        } finally {
            loading.style.display = 'none';
            verifyTokenBtn.disabled = false;
        }
    }

    // Toggle entre formularios
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const formType = btn.dataset.form;

            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });

            document.getElementById(`${formType}Form`).classList.add('active');
        });
    });

    // Manejo de Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAuthRequest({
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value.trim()
        }, 'login');
    });

    // Manejo de Registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('regPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (password !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            return;
        }


        await handleAuthRequest({
            username: document.getElementById('regUsername').value.trim(),
            password: password
        }, 'register');
    });

    // Función principal de autenticación
    async function handleAuthRequest(data, endpoint) {
        clearMessages();
        loading.style.display = 'block';

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(data),
                credentials: 'include'
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `Error HTTPS! estado: ${response.status}`);
            }

            tokenInput.value = responseData.token;
            showTempMessage(
                endpoint === 'login'
                    ? '¡Inicio de sesión exitoso!'
                    : '¡Cuenta creada correctamente!',
                'success'
            );

        } catch (error) {
            handleApiError(error);
        } finally {
            loading.style.display = 'none';
        }
    }

    // Manejo de errores de la API
    function handleApiError(error) {
        const errorMsg = error.message.includes('Failed to fetch') ? 'Error de conexión con el servidor'
        : error.message.replace('HTTPS error! ', '');
        showTempMessage(errorMsg, 'error');
    }

    // Copiar token al portapapeles
    copyTokenBtn.addEventListener('click', () => {
        if (tokenInput.value) {
            navigator.clipboard.writeText(tokenInput.value);
            showTempMessage('Token copiado al portapapeles', 'success');
        }
    });

    // Helpers de UI
    function clearMessages() {
        errorMessage.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // Variables para controlar el mensaje temporal
    let currentMessage = null;
    let messageTimeout = null;

    function showTempMessage(message, type) {
        // Eliminar mensaje existente
        if (currentMessage) {
            currentMessage.remove();
            clearTimeout(messageTimeout);
        }

        // Crear nuevo mensaje
        const msg = document.createElement('div');
        msg.className = `temp-message ${type} show`;
        msg.textContent = message;
        document.body.appendChild(msg);
        currentMessage = msg;

        // Auto-eliminación después de 3 segundos
        messageTimeout = setTimeout(() => {
            msg.classList.remove('show');
            setTimeout(() => {
                msg.remove();
                currentMessage = null;
            }, 300); // Coincide con la duración de la transición
        }, 3000);
    }
});