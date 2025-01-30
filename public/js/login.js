document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const tokenInput = document.getElementById('bearerToken');
    const copyTokenBtn = document.getElementById('copyTokenBtn');
    const loading = document.getElementById('loading');
    const verifyTokenBtn = document.getElementById('verifyTokenBtn');

    // Configuración de los endpoints de la API
    const API_BASE_URL = 'https://localhost:3000/auth';
    const HEADERS = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    verifyTokenBtn.addEventListener('click', async () => {
        await verifyToken();
    });

    async function verifyToken() {
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

            if (response.status === 400) {
                showTempMessage("Token invalido", 'error');

            }else if (response.status === 200) {
                showTempMessage('Token verificado', 'success');
            }

        } catch (error) {
            showTempMessage(error.message, 'error');
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
            showTempMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        await handleAuthRequest({
            username: document.getElementById('regUsername').value.trim(),
            password: password
        }, 'register');
    });

    // Función principal de autenticación
    async function handleAuthRequest(data, endpoint) {
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

            if (endpoint === 'login') {
                tokenInput.value = responseData.token;
                showTempMessage('¡Inicio de sesión exitoso!', 'success');
            } else if (endpoint === 'register') {
                showTempMessage('¡Cuenta creada correctamente!', 'success');
            }

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
            }, 3000);
        }, 3000);
    }
});