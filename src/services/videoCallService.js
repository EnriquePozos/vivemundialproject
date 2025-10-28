// src/services/videoCallService.js
// Servicio para manejar videollamadas con LiveKit

// URL base de tu backend
const API_BASE_URL = 'https://uneroded-forest-untasked.ngrok-free.dev/POI/vivemundialproject/vivemundialproject/backend/api';

// Helper para hacer peticiones con autenticación
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

export const videoCallService = {
  /**
   * Obtener token para unirse a una sala de LiveKit
   * @param {string} roomName - Nombre de la sala
   * @param {string} participantName - Nombre del participante
   */
  obtenerToken: async (roomName, participantName) => {
    return await fetchWithAuth(`${API_BASE_URL}/videocall/token`, {
      method: 'POST',
      body: JSON.stringify({
        roomName,
        participantName,
      }),
    });
  },

  /**
   * Iniciar una videollamada
   * @param {number} id_Chat - ID del chat
   * @param {string} tipo - Tipo de llamada ('privada' o 'grupal')
   */
  iniciarLlamada: async (id_Chat, tipo = 'privada') => {
    return await fetchWithAuth(`${API_BASE_URL}/videocall/iniciar`, {
      method: 'POST',
      body: JSON.stringify({
        id_Chat,
        tipo,
      }),
    });
  },

  /**
   * Finalizar una videollamada
   * @param {string} roomName - Nombre de la sala
   */
  finalizarLlamada: async (roomName) => {
    return await fetchWithAuth(`${API_BASE_URL}/videocall/finalizar`, {
      method: 'POST',
      body: JSON.stringify({
        roomName,
      }),
    });
  },
};

export default videoCallService;