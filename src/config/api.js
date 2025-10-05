// Configuración de la API
const API_BASE_URL = 'https://uneroded-forest-untasked.ngrok-free.dev/POI/vivemundialproject/vivemundialproject/backend/api';

// Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTRO: `${API_BASE_URL}/auth/registro`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  CHATS: {
    CREAR: `${API_BASE_URL}/chats/crear`,
    MIS_CHATS: `${API_BASE_URL}/chats/mis-chats`,
    INFO: `${API_BASE_URL}/chats/info`,
    MENSAJES: `${API_BASE_URL}/chats/mensajes`,
    ENVIAR: `${API_BASE_URL}/chats/enviar`,
  },
};

// Función para hacer peticiones con token
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Proteger contra respuestas que no son JSON (por ejemplo HTML de error o advertencia)
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const short = text ? text.substring(0, 500) : '';
    console.error('fetchWithAuth: respuesta no JSON desde', url, 'status:', response.status, short);
    // Lanzar un error descriptivo para que el caller lo maneje
    throw new Error(`La respuesta del servidor no es JSON (status ${response.status}). Respuesta (inicio): ${short}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }

  return data;
};

// Servicios de autenticación
export const authService = {
  // Registrar usuario
  registro: async (nombre_Usuario, Correo, Contrasenia) => {
    const data = await fetchWithAuth(API_ENDPOINTS.AUTH.REGISTRO, {
      method: 'POST',
      body: JSON.stringify({ nombre_Usuario, Correo, Contrasenia }),
    });

    if (data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
    }

    return data;
  },

  // Iniciar sesión
  login: async (Correo, Contrasenia) => {
    const data = await fetchWithAuth(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ Correo, Contrasenia }),
    });

    if (data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
    }

    return data;
  },

  // Cerrar sesión
  logout: async () => {
    const data = await fetchWithAuth(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    return data;
  },

  // Obtener usuario actual
  me: async () => {
    return await fetchWithAuth(API_ENDPOINTS.AUTH.ME);
  },

  // Verificar si hay sesión activa
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario del localStorage
  getUsuario: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },
};

// Servicios de chats
export const chatService = {
  // Crear chat privado
  crearChatPrivado: async (id_Destinatario) => {
    return await fetchWithAuth(API_ENDPOINTS.CHATS.CREAR, {
      method: 'POST',
      body: JSON.stringify({
        tipo_Chat: 'privado',
        id_Destinatario
      }),
    });
  },

  // Crear chat grupal
  crearChatGrupal: async (nombre_Chat, participantes) => {
    return await fetchWithAuth(API_ENDPOINTS.CHATS.CREAR, {
      method: 'POST',
      body: JSON.stringify({
        tipo_Chat: 'grupal',
        nombre_Chat,
        participantes
      }),
    });
  },

  // Obtener mis chats
  obtenerMisChats: async () => {
    return await fetchWithAuth(API_ENDPOINTS.CHATS.MIS_CHATS);
  },

  // Obtener info de un chat
  obtenerChat: async (id_Chat) => {
    return await fetchWithAuth(`${API_ENDPOINTS.CHATS.INFO}?id_Chat=${id_Chat}`);
  },

  // Obtener mensajes de un chat
  obtenerMensajes: async (id_Chat, limite = 50) => {
    return await fetchWithAuth(`${API_ENDPOINTS.CHATS.MENSAJES}?id_Chat=${id_Chat}&limite=${limite}`);
  },

  // Enviar mensaje
  enviarMensaje: async (id_Chat, mensaje, encriptado = false, tipo_Mensaje = 'texto') => {
    return await fetchWithAuth(API_ENDPOINTS.CHATS.ENVIAR, {
      method: 'POST',
      body: JSON.stringify({
        id_Chat,
        mensaje,
        encriptado,
        tipo_Mensaje
      }),
    });
  },
};

export default authService;