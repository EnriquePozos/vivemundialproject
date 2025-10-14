// src/hooks/useSocket.js
// Hook personalizado para manejar la conexión de Socket.IO

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://hlrmkghf-3001.usw3.devtunnels.ms/'; // Cambiar a tu URL de producción

export const useSocket = (userId, userName) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const listenersRef = useRef(new Set()); // Para rastrear listeners y limpiarlos

  useEffect(() => {
    // Solo conectar si hay un usuario autenticado
    if (!userId || !userName) {
      console.log('⏳ Esperando autenticación para conectar socket...');
      return;
    }

    // Evitar múltiples conexiones
    if (socketRef.current?.connected) {
      console.log('⚠️ Socket ya está conectado, evitando duplicados');
      return;
    }

    // Crear conexión de socket
    console.log('🔌 Conectando a Socket.IO...');
    console.log(`👤 Usuario: ${userName} (ID: ${userId})`);
    
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10, // Aumentado a 10 intentos
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    const socket = socketRef.current;

    // ===============================
    // EVENTOS DE CONEXIÓN
    // ===============================
    socket.on('connect', () => {
      console.log('✅ Conectado a Socket.IO');
      console.log(`🆔 Socket ID: ${socket.id}`);
      setIsConnected(true);
      setIsReconnecting(false);
      
      // Registrar usuario en el servidor
      socket.emit('user:join', { userId, userName });
      console.log('📤 Evento user:join emitido');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado de Socket.IO');
      console.log('📋 Razón:', reason);
      setIsConnected(false);
      
      // Si fue desconexión del servidor, intentar reconectar
      if (reason === 'io server disconnect') {
        console.log('🔄 Reconectando manualmente...');
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      setIsConnected(false);
      setIsReconnecting(true);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Intento de reconexión #${attemptNumber}`);
      setIsReconnecting(true);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconectado después de ${attemptNumber} intento(s)`);
      setIsConnected(true);
      setIsReconnecting(false);
      
      // Re-registrar usuario después de reconexión
      socket.emit('user:join', { userId, userName });
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Falló la reconexión después de todos los intentos');
      setIsReconnecting(false);
    });

    // ===============================
    // EVENTOS DE USUARIOS
    // ===============================
    socket.on('user:online', (data) => {
      console.log('👤 Usuario en línea:', data.userName);
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    socket.on('user:offline', (data) => {
      console.log('👋 Usuario desconectado:', data.userName);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // ===============================
    // CLEANUP AL DESMONTAR
    // ===============================
    return () => {
      console.log('🧹 Limpiando conexión de socket...');
      
      // Limpiar todos los listeners rastreados
      listenersRef.current.forEach(eventName => {
        socket.off(eventName);
      });
      listenersRef.current.clear();
      
      // Desconectar socket
      if (socket.connected) {
        socket.disconnect();
        console.log('🔌 Socket desconectado');
      }
    };
  }, [userId, userName]);

  // ===============================
  // FUNCIONES AUXILIARES
  // ===============================
  
  const joinChat = (chatId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat:join', chatId);
      console.log(`📨 Uniéndose al chat ${chatId}`);
    } else {
      console.warn('⚠️ No se puede unir al chat, socket no conectado');
    }
  };

  const leaveChat = (chatId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat:leave', chatId);
      console.log(`📤 Saliendo del chat ${chatId}`);
    }
  };

  const sendMessage = (messageData) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message:send', messageData);
      console.log('💬 Mensaje enviado via socket:', messageData);
    } else {
      console.warn('⚠️ No se puede enviar mensaje, socket no conectado');
    }
  };

  const onMessageReceived = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('message:received', callback);
      listenersRef.current.add('message:received');
    }
  };

  const offMessageReceived = () => {
    if (socketRef.current) {
      socketRef.current.off('message:received');
      listenersRef.current.delete('message:received');
    }
  };

  const notifyTyping = (chatId, userName) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing:start', { chatId, userName });
    }
  };

  const notifyStopTyping = (chatId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing:stop', { chatId });
    }
  };

  // ===============================
  // EVENTOS GLOBALES
  // ===============================
  
  const onGlobalEvent = (eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
      listenersRef.current.add(eventName);
      console.log(`👂 Escuchando evento global: ${eventName}`);
    }
  };

  const offGlobalEvent = (eventName) => {
    if (socketRef.current) {
      socketRef.current.off(eventName);
      listenersRef.current.delete(eventName);
      console.log(`🔇 Dejando de escuchar evento: ${eventName}`);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    isReconnecting, // NUEVO: estado de reconexión
    onlineUsers,
    joinChat,
    leaveChat,
    sendMessage,
    onMessageReceived,
    offMessageReceived,
    notifyTyping,
    notifyStopTyping,
    onGlobalEvent,
    offGlobalEvent,
  };
};