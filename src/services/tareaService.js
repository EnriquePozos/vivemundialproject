// src/services/tareaService.js
// Servicio para manejar operaciones de tareas

// URL base de tu backend (ajusta según tu configuración de ngrok)
const API_BASE_URL = 'https://uneroded-forest-untasked.ngrok-free.dev/POI/vivemundialproject/vivemundialproject/backend/api';

/**
 * Helper para hacer peticiones con autenticación
 */
const fetchWithAuth = async (url, options = {}) => {
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }

  return data;
};

export const tareaService = {
  /**
   * Crear una nueva tarea
   * @param {number} id_Chat - ID del chat grupal
   * @param {string} titulo - Título de la tarea
   * @param {string} descripcion - Descripción (opcional)
   * @param {number} puntos_Recompensa - Puntos (default: 10)
   */
  crearTarea: async (id_Chat, titulo, descripcion = '', puntos_Recompensa = 10) => {
    return await fetchWithAuth(`${API_BASE_URL}/tareas.php/tareas/crear`, {
      method: 'POST',
      body: JSON.stringify({
        id_Chat,
        titulo,
        descripcion,
        puntos_Recompensa,
      }),
    });
  },

  /**
   * Listar todas las tareas de un chat
   * @param {number} id_Chat - ID del chat
   */
  listarTareas: async (id_Chat) => {
    return await fetchWithAuth(`${API_BASE_URL}/tareas.php/tareas/listar?id_Chat=${id_Chat}`, {
      method: 'GET',
    });
  },

  /**
   * Completar una tarea (primera persona en llegar)
   * @param {number} id_Tarea - ID de la tarea
   */
  completarTarea: async (id_Tarea) => {
    return await fetchWithAuth(`${API_BASE_URL}/tareas.php/tareas/completar?id=${id_Tarea}`, {
      method: 'PUT',
    });
  },

  /**
   * Eliminar una tarea (solo el creador puede)
   * @param {number} id_Tarea - ID de la tarea
   */
  eliminarTarea: async (id_Tarea) => {
    return await fetchWithAuth(`${API_BASE_URL}/tareas.php/tareas/eliminar?id=${id_Tarea}`, {
      method: 'DELETE',
    });
  },

  /**
   * Obtener una tarea específica
   * @param {number} id_Tarea - ID de la tarea
   */
  obtenerTarea: async (id_Tarea) => {
    return await fetchWithAuth(`${API_BASE_URL}/tareas.php/tareas/obtener?id=${id_Tarea}`, {
      method: 'GET',
    });
  },
};

export default tareaService;