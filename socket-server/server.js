// socket-server/server.js
// Servidor de WebSockets para mensajería en tiempo real

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configurar Socket.IO con CORS
const io = new Server(server, {
  cors: {
    origin: "*", // En producción, especifica tu dominio
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Almacenar usuarios conectados
const connectedUsers = new Map(); // { userId: socketId }
const userSockets = new Map(); // { socketId: { userId, userName } }

// Cuando un cliente se conecta
io.on('connection', (socket) => {
  console.log('🔌 Nuevo cliente conectado:', socket.id);

  // Evento: Usuario se une con su información
  socket.on('user:join', (userData) => {
    const { userId, userName } = userData;
    
    // Guardar la relación usuario-socket
    connectedUsers.set(userId, socket.id);
    userSockets.set(socket.id, { userId, userName });
    
    console.log(`👤 Usuario conectado: ${userName} (ID: ${userId})`);
    
    // Notificar a todos que el usuario está en línea
    io.emit('user:online', { userId, userName });
  });

  // Evento: Usuario se une a un chat específico
  socket.on('chat:join', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`📨 Socket ${socket.id} se unió al chat ${chatId}`);
  });

  // Evento: Usuario sale de un chat específico
  socket.on('chat:leave', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`📤 Socket ${socket.id} salió del chat ${chatId}`);
  });

  // Evento: Nuevo mensaje enviado
socket.on('message:send', (messageData) => {
  console.log(`💬 Mensaje/Evento recibido:`, messageData);
  
  // Reenviar TODO el objeto completo sin destrucción
  io.to(`chat_${messageData.chatId}`).emit('message:received', {
    ...messageData,
    messageId: messageData.messageId || Date.now()
  });
});
// ============================================
  // EVENTOS DE QUINIELAS
  // ============================================

  /**
   * Evento: quiniela:added
   * Cuando se agrega una quiniela a un chat
   */
  socket.on('quiniela:added', (data) => {
    console.log('🏆 Quiniela agregada al chat:', data);
    
    // Emitir a todos los usuarios del chat
    io.to(`chat_${data.id_Chat}`).emit('message:received', {
      type: 'quiniela_added',
      chatId: data.id_Chat,
      quiniela: data.quiniela,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Evento: quiniela:participated
   * Cuando un usuario participa en una quiniela
   */
  socket.on('quiniela:participated', (data) => {
    console.log('🎲 Usuario participó en quiniela:', data);
    
    // Emitir a todos los usuarios del chat
    io.to(`chat_${data.id_Chat}`).emit('message:received', {
      type: 'quiniela_participated',
      chatId: data.id_Chat,
      id_Quiniela_Chat: data.id_Quiniela_Chat,
      usuario: data.usuario,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Evento: quiniela:finished
   * Cuando una quiniela es finalizada
   */
  socket.on('quiniela:finished', (data) => {
    console.log('🏁 Quiniela finalizada:', data);
    
    // Emitir a todos los usuarios del chat
    io.to(`chat_${data.id_Chat}`).emit('message:received', {
      type: 'quiniela_finished',
      chatId: data.id_Chat,
      id_Quiniela_Chat: data.id_Quiniela_Chat,
      resultado: data.resultado,
      ganadores: data.ganadores,
      timestamp: new Date().toISOString()
    });
  });
  // Evento: Notificar que el mensaje fue guardado en BD
  socket.on('message:saved', (messageData) => {
    const { chatId, messageId, dbMessageId } = messageData;
    
    // Notificar a todos los usuarios del chat que el mensaje tiene ID de BD
    io.to(`chat_${chatId}`).emit('message:confirmed', {
      tempMessageId: messageId,
      dbMessageId: dbMessageId
    });
  });

  // Evento: Usuario está escribiendo
  socket.on('typing:start', (data) => {
    const { chatId, userName } = data;
    socket.to(`chat_${chatId}`).emit('user:typing', { chatId, userName });
  });

  // Evento: Usuario dejó de escribir
  socket.on('typing:stop', (data) => {
    const { chatId } = data;
    socket.to(`chat_${chatId}`).emit('user:stop-typing', { chatId });
  }); 
   
socket.on('user:icon:update', (data) => {
  console.log('🎨 [SERVER] Usuario actualizó icono:', data);
  console.log('📊 [SERVER] Data recibida:', JSON.stringify(data, null, 2));
  
  io.emit('user:icon:update', {
    userId: data.userId,
    userName: data.userName,
    iconoPerfil: data.iconoPerfil,
    timestamp: new Date().toISOString()
  });
  
  console.log('✅ [SERVER] Evento user:icon:update broadcast completado');
  console.log('👥 [SERVER] Clientes conectados:', io.engine.clientsCount);
});

// Actualización de Estado de Usuario 
socket.on('user:status:update', (data) => {
  console.log('🟢 [SERVER] Usuario actualizó estado:', data);
  console.log('📊 [SERVER] Data recibida:', JSON.stringify(data, null, 2));
  
  // Broadcast a TODOS los clientes conectados
  io.emit('user:status:update', {
    userId: data.userId,
    userName: data.userName,
    estado: data.estado, // 1 = ONLINE, 0 = OFFLINE
    timestamp: new Date().toISOString()
  });
  
  console.log(`✅ [SERVER] Evento user:status:update broadcast completado - Usuario ${data.userName} ahora está ${data.estado === 1 ? 'ONLINE' : 'OFFLINE'}`);
  console.log('👥 [SERVER] Clientes conectados:', io.engine.clientsCount);
});
  // Cuando un cliente se desconecta
  socket.on('disconnect', () => {
    const userData = userSockets.get(socket.id);
    
    if (userData) {
      const { userId, userName } = userData;
      
      // Eliminar de los mapas
      connectedUsers.delete(userId);
      userSockets.delete(socket.id);
      
      console.log(`👋 Usuario desconectado: ${userName} (ID: ${userId})`);
      
      // Notificar a todos que el usuario está offline
      io.emit('user:offline', { userId, userName });
    } else {
      console.log('🔌 Cliente desconectado:', socket.id);
    }
  });
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Socket.IO corriendo en puerto ${PORT}`);
  console.log(`📡 WebSocket disponible en: ws://localhost:${PORT}`);
});