/**
 * Servicio: tiendaService
 * Descripción: Maneja todas las peticiones relacionadas con la tienda de iconos
 * Consume la API /api/tienda
 */

const API_BASE_URL = 'https://uneroded-forest-untasked.ngrok-free.dev/POI/vivemundialproject/vivemundialproject/backend/api';

/**
 * Obtener token de autenticación del localStorage
 * @returns {string|null}
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Configurar headers para las peticiones
 * @returns {Object}
 */
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'ngrok-skip-browser-warning': 'true'
  };
};

const tiendaService = {
  /**
   * Obtener todos los iconos disponibles en la tienda
   * @returns {Promise<Object>}
   */
  obtenerIconosDisponibles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tienda`, {
        method: 'GET',
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener iconos de la tienda');
      }

      return {
        success: true,
        data: data.data || [],
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error en obtenerIconosDisponibles:', error);
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  },

  /**
   * Obtener los iconos comprados por el usuario actual
   * @returns {Promise<Object>}
   */
  obtenerMisIconos: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tienda/mis-iconos`, {
        method: 'GET',
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener tus iconos');
      }

      return {
        success: true,
        data: data.data || { iconos: [], icono_equipado: null },
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error en obtenerMisIconos:', error);
      return {
        success: false,
        data: { iconos: [], icono_equipado: null },
        message: error.message
      };
    }
  },

  /**
   * Comprar un icono de la tienda
   * @param {number} id_Icono - ID del icono a comprar
   * @returns {Promise<Object>}
   */
  comprarIcono: async (id_Icono) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tienda/comprar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ id_Icono })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al comprar el icono');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error en comprarIcono:', error);
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  },

  /**
   * Equipar un icono ya comprado
   * @param {number} id_Icono - ID del icono a equipar
   * @returns {Promise<Object>}
   */
  equiparIcono: async (id_Icono) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tienda/equipar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ id_Icono })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al equipar el icono');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error en equiparIcono:', error);
      return {
        success: false,
        data: null,
        message: error.message
      };
    }
  },

  /**
   * Desequipar el icono actual
   * @returns {Promise<Object>}
   */
  desequiparIcono: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tienda/desequipar`, {
        method: 'POST',
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al desequipar el icono');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error en desequiparIcono:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

export default tiendaService;