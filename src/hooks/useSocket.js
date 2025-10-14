// src/hooks/useSocket.js
// Hook personalizado para manejar la conexión de Socket.IO

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://hlrmkghf-3001.usw3.devtunnels.ms/'; // Cambiar a tu URL de producción

export const useSocket = (userId, userName) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    // Solo conectar si hay un usuario autenticado
    if (!userId || !userName) {
      console.log('⏳ Esperando autenticación para conectar socket...');
      return;
    }

    // Crear conexión de socket
    console.log('🔌 Conectando a Socket.IO...');
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('✅ Conectado a Socket.IO:', socket.id);
      setIsConnected(true);
      
      // Registrar usuario en el servidor
      socket.emit('user:join', { userId, userName });
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado de Socket.IO');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      setIsConnected(false);
    });

    // Eventos de usuarios
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

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Cerrando conexión de socket...');
      socket.disconnect();
    };
  }, [userId, userName]);

  // Funciones auxiliares
  const joinChat = (chatId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat:join', chatId);
      console.log(`📨 Uniéndose al chat ${chatId}`);
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
      console.log('💬 Mensaje enviado via socket');
    }
  };

  const onMessageReceived = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('message:received', callback);
    }
  };

  const offMessageReceived = () => {
    if (socketRef.current) {
      socketRef.current.off('message:received');
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

  // NUEVO: Escuchar eventos globales (nuevos chats, notificaciones, etc)
  const onGlobalEvent = (eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
    }
  };

  const offGlobalEvent = (eventName) => {
    if (socketRef.current) {
      socketRef.current.off(eventName);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinChat,
    leaveChat,
    sendMessage,
    onMessageReceived,
    offMessageReceived,
    notifyTyping,
    notifyStopTyping,
    onGlobalEvent,      // NUEVO
    offGlobalEvent,     // NUEVO
  };
};