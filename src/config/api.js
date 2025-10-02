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
};

// Función para hacer peticiones con token
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

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

export default authService;