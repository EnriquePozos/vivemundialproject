// src/services/quinielaService.js

// URL base de tu backend (ajusta según tu configuración de ngrok)
const API_BASE_URL = 'https://uneroded-forest-untasked.ngrok-free.dev/POI/vivemundialproject/vivemundialproject/backend/api';


/**
 * Servicio para gestionar quinielas
 */
const quinielaService = {
  /**
   * Listar quinielas disponibles (pre-cargadas en BD)
   */
listarDisponibles: async () => {
    try {
      const token = localStorage.getItem('token');
      
      // ⭐ TEMPORAL: Ver el token
      console.log('🔑 Token completo:', token);
      console.log('🔑 Tiene token?:', !!token);
      console.log('🔑 Longitud:', token?.length);
      
      const response = await fetch(`${API_BASE_URL}/quinielas.php?ruta=disponibles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      // ⭐ VER EL TEXTO CRUDO ANTES DE PARSEARLO
      const textoRespuesta = await response.text();
      console.log('📄 TEXTO CRUDO COMPLETO:', textoRespuesta);
      console.log('📄 Primeros 500 caracteres:', textoRespuesta.substring(0, 500));
      console.log('📄 Longitud del texto:', textoRespuesta.length);

      // Intentar parsear JSON
      let data;
      try {
        data = JSON.parse(textoRespuesta);
        console.log('✅ JSON parseado correctamente:', data);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON');
        console.error('❌ El texto NO es JSON válido');
        console.error('❌ Texto recibido:', textoRespuesta);
        throw new Error('El servidor devolvió HTML en lugar de JSON');
      }
      
      if (!response.ok) {
        throw new Error(data.error || data.mensaje || 'Error del servidor');
      }

      // Verificar estructura
      if (data && data.data && data.data.quinielas) {
        console.log('✅ Quinielas encontradas:', data.data.quinielas.length);
        return {
          success: true,
          data: {
            quinielas: data.data.quinielas
          }
        };
      } else {
        console.warn('⚠️ Estructura inesperada:', data);
return {
  success: true,
  data: {
    quinielas: data.message?.quinielas || data.data?.quinielas || []
  }
};
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      throw error;
    }
  },

  /**
   * Agregar quiniela a un chat
   * @param {number} id_Quiniela - ID de la quiniela a agregar
   * @param {number} id_Chat - ID del chat
   */
  agregarAChat: async (id_Quiniela, id_Chat) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/quinielas.php?ruta=agregar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_Quiniela,
          id_Chat
        })
      });

      const data = await response.json();
      
      console.log('📡 Respuesta agregar:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al agregar quiniela al chat');
      }

      return data;
    } catch (error) {
      console.error('Error en agregarAChat:', error);
      throw error;
    }
  },

  /**
   * Listar quinielas de un chat específico
   * @param {number} id_Chat - ID del chat
   */
  listarPorChat: async (id_Chat) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/quinielas.php?ruta=listar&id_Chat=${id_Chat}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('📡 Respuesta listar:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener quinielas del chat');
      }

return {
  success: true,
  data: {
    quinielas: data.message?.quinielas || data.data?.quinielas || []
  }
};
    } catch (error) {
      console.error('Error en listarPorChat:', error);
      throw error;
    }
  },

  /**
   * Participar en una quiniela
   * @param {number} id_Quiniela_Chat - ID de la quiniela en el chat
   * @param {number} puntos_Apostados - Puntos a apostar
   * @param {string} prediccion - Predicción del usuario
   */
  participar: async (id_Quiniela_Chat, puntos_Apostados, prediccion) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/quinielas.php?ruta=participar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_Quiniela_Chat,
          puntos_Apostados,
          prediccion
        })
      });

      const data = await response.json();
      
      console.log('📡 Respuesta participar:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al participar en la quiniela');
      }

      return data;
    } catch (error) {
      console.error('Error en participar:', error);
      throw error;
    }
  },

  /**
   * Finalizar quiniela y declarar ganadores
   * @param {number} id_Quiniela_Chat - ID de la quiniela en el chat
   * @param {string} resultado - Resultado real de la quiniela
   */
  finalizar: async (id_Quiniela_Chat, resultado) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/quinielas.php?ruta=finalizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_Quiniela_Chat,
          resultado
        })
      });

      const data = await response.json();
      
      console.log('📡 Respuesta finalizar:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al finalizar la quiniela');
      }

      return data;
    } catch (error) {
      console.error('Error en finalizar:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles completos de una quiniela
   * @param {number} id_Quiniela_Chat - ID de la quiniela en el chat
   */
  obtenerDetalles: async (id_Quiniela_Chat) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/quinielas.php?ruta=detalles&id=${id_Quiniela_Chat}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('📡 Respuesta detalles:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener detalles de la quiniela');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerDetalles:', error);
      throw error;
    }
  },

  /**
   * Listar todas las participaciones de una quiniela
   * @param {number} id_Quiniela_Chat - ID de la quiniela en el chat
   */
  listarParticipaciones: async (id_Quiniela_Chat) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/quinielas.php?ruta=participaciones&id=${id_Quiniela_Chat}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('📡 Respuesta participaciones:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener participaciones');
      }

      return data;
    } catch (error) {
      console.error('Error en listarParticipaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener mi participación en una quiniela
   * @param {number} id_Quiniela_Chat - ID de la quiniela en el chat
   */
  obtenerMiParticipacion: async (id_Quiniela_Chat) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/quinielas.php?ruta=mi-participacion&id=${id_Quiniela_Chat}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      console.log('📡 Respuesta mi participación:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener mi participación');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerMiParticipacion:', error);
      throw error;
    }
  }
};

export default quinielaService;