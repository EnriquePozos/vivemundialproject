import React, { useState, useRef, useEffect } from "react";
import { Moon, Sun, ChevronDown } from "lucide-react";
import {
  MessageCircle,
  Users,
  Plus,
  Search,
  Trophy,
  Coins,
  User,
  Settings,
  ShoppingBag,
  Target,
  Bell,
  LogOut,
  CheckCircle,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Clock,
  Shield,
  ShieldOff,
  MapPin,
  Image,
  FileText,
  Mic,
} from "lucide-react";
import { API_ENDPOINTS, chatService, userService } from "../config/api"; // <--- MODIFICACIÓN: Importamos userService
import { useSocket } from "../hooks/useSocket";
import VideoCall from "./VideoCall"; // Componente de videollamadas

// Componente de Chat Privado integrado
const PrivateChat = ({
  chatData,
  onBack,
  currentUserId,
  userName,
  isConnected,
  joinChat,
  leaveChat,
  sendSocketMessage,
  onMessageReceived,
  offMessageReceived,
}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallType, setVideoCallType] = useState('privada');

  // Cargar mensajes del chat
  useEffect(() => {
    if (chatData?.id_Chat) {
      loadMessages();
    }
  }, [chatData?.id_Chat]);

  useEffect(() => {
  if (chatData?.id_Chat && isConnected) {
    console.log('🔗 Uniéndose al chat:', chatData.id_Chat);
    joinChat(chatData.id_Chat);

    // Cleanup: salir del chat cuando se cierre o cambie
    return () => {
      console.log('👋 Saliendo del chat:', chatData.id_Chat);
      leaveChat(chatData.id_Chat);
    };
  }
}, [chatData?.id_Chat, isConnected]);

// Escuchar mensajes en tiempo real del chat actual
useEffect(() => {
  if (!isConnected || !chatData?.id_Chat) return;

  console.log('👂 Escuchando mensajes en tiempo real para chat:', chatData.id_Chat);

  const handleNewMessage = (messageData) => {
    console.log('📨 Mensaje recibido por WebSocket:', messageData);

    // Solo agregar si es del chat actual
    if (messageData.chatId === chatData.id_Chat) {
      
      // Formatear hora
      let timeString = "";
      try {
        const date = new Date(messageData.timestamp);
        timeString = date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        timeString = "Ahora";
      }

      // =========================================
      // FORMATO UNIFICADO - IMPORTANTE
      // =========================================
      const formattedMessage = {
        // IDs
        id: messageData.messageId || Date.now(),
        id_Mensaje: messageData.messageId || Date.now(),
        
        // Contenido del mensaje
        message: messageData.message,        // ← Para renderizado
        contenido: messageData.message,      // ← Para compatibilidad
        
        // Usuario
        sender: messageData.senderName,
        nombre_Usuario: messageData.senderName,
        
        // Metadata
        time: timeString,
        timeString: timeString,
        fecha_Hora: messageData.timestamp,
        
        // Tipo y estado
        tipo: messageData.type || 'texto',
        tipo_Mensaje: messageData.type || 'texto',
        encrypted: messageData.encrypted || false,
        cifrado: messageData.encrypted || false,
        
        // Identificar si es mensaje propio
        isOwn: messageData.senderId === currentUserId,
        id_Usuario: messageData.senderId
      };

      console.log('📝 Mensaje formateado:', formattedMessage);

      // Agregar el mensaje al estado (evitar duplicados por ID)
      setMessages(prevMessages => {
        // Verificar si el mensaje ya existe por ID
        const exists = prevMessages.some(msg => 
          msg.id === formattedMessage.id || 
          msg.id_Mensaje === formattedMessage.id_Mensaje
        );
        
        if (exists) {
          console.log('⚠️ Mensaje duplicado detectado, no se agrega');
          return prevMessages;
        }

        console.log('✅ Agregando mensaje nuevo al estado');
        return [...prevMessages, formattedMessage];
      });
    }
  };

  // Registrar el listener
  onMessageReceived(handleNewMessage);

  // Cleanup
  return () => {
    console.log('🧹 Limpiando listener de mensajes del chat:', chatData.id_Chat);
    offMessageReceived();
  };
}, [chatData?.id_Chat, isConnected, currentUserId]);


const loadMessages = async () => {
  try {
    setLoading(true);
    console.log("🔍 Cargando mensajes del chat:", chatData.id_Chat);
    console.log("👤 currentUserId:", currentUserId, "Tipo:", typeof currentUserId);

    const response = await chatService.obtenerMensajes(chatData.id_Chat, 50);
    
    if (response.success) {
      console.log("📥 Mensajes recibidos:", response.data.length, "mensajes");

      const formattedMessages = response.data.map((msg) => {
        // Parsear la fecha correctamente desde MySQL
        let timeString = "";
        try {
          const dateStr = msg.fecha_Hora.replace(" ", "T");
          const date = new Date(dateStr);
          timeString = date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (e) {
          console.warn("Error al parsear fecha:", e);
          timeString = "Hora desconocida";
        }

        // =========================================
        // COMPARACIÓN ARREGLADA CON CONVERSIÓN
        // =========================================
        // Convertir ambos a número para comparar correctamente
        const remitente = Number(msg.id_Remitente);
        const usuarioActual = Number(currentUserId);
        const esMio = remitente === usuarioActual;

        // DEBUG: Solo para los primeros 3 mensajes
        if (msg.id_Mensaje <= response.data[2]?.id_Mensaje) {
          console.log(`📝 Mensaje ${msg.id_Mensaje}:`);
          console.log(`   - id_Remitente: ${msg.id_Remitente} (tipo: ${typeof msg.id_Remitente})`);
          console.log(`   - currentUserId: ${currentUserId} (tipo: ${typeof currentUserId})`);
          console.log(`   - Convertidos: ${remitente} === ${usuarioActual}`);
          console.log(`   - ¿Es mío?: ${esMio}`);
        }

        const formattedMsg = {
          // IDs
          id: msg.id_Mensaje,
          id_Mensaje: msg.id_Mensaje,
          
          // Contenido del mensaje
          message: msg.mensaje,
          contenido: msg.mensaje,
          
          // Usuario
          sender: msg.nombre_Usuario,
          nombre_Usuario: msg.nombre_Usuario,
          
          // Metadata
          time: timeString,
          timeString: timeString,
          fecha_Hora: msg.fecha_Hora,
          
          // Tipo y estado
          tipo: msg.tipo_Mensaje || 'texto',
          tipo_Mensaje: msg.tipo_Mensaje || 'texto',
          encrypted: msg.encriptado === 1 || msg.encriptado === true,
          cifrado: msg.encriptado === 1 || msg.encriptado === true,
          
          // Identificar si es mensaje propio (CONVERSIÓN ARREGLADA)
          isOwn: esMio,  // ← USANDO LA COMPARACIÓN ARREGLADA
          id_Usuario: msg.id_Remitente,
          id_Remitente: msg.id_Remitente
        };

        return formattedMsg;
      });

      setMessages(formattedMessages);
      console.log("✅ Mensajes cargados y formateados:", formattedMessages.length);
    } else {
      console.warn("⚠️ No se pudieron cargar mensajes");
      setMessages([]);
    }
  } catch (error) {
    console.error("❌ Error al cargar mensajes:", error);
    setMessages([]);
  } finally {
    setLoading(false);
  }
};

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 const sendMessage = async () => {
  if (!message.trim()) {
    console.warn('⚠️ Mensaje vacío, no se envía');
    return;
  }

  if (!chatData?.id_Chat || !currentUserId) {
    console.error('❌ Faltan datos necesarios');
    alert('Error: No se puede enviar el mensaje');
    return;
  }

  const messageToSend = message.trim();
  setMessage(""); // Limpiar input inmediatamente

  try {
    console.log('📤 Enviando mensaje...');

    // 1. Guardar en base de datos
    const response = await chatService.enviarMensaje(
      chatData.id_Chat,
      messageToSend,
      encryptionEnabled,
      "texto"
    );

    console.log('✅ Mensaje guardado en BD:', response);

    if (!response || !response.success) {
      throw new Error('Error al guardar el mensaje');
    }

    // 2. Emitir por WebSocket
    if (isConnected) {
      const messageData = {
        chatId: chatData.id_Chat,
        message: messageToSend,
        senderId: currentUserId,
        senderName: userName || 'Usuario',
        messageId: response.data?.id_Mensaje || Date.now(),
        timestamp: new Date().toISOString(),
        type: 'texto',
        encrypted: encryptionEnabled
      };

      console.log('🔌 Emitiendo por WebSocket:', messageData);
      sendSocketMessage(messageData);
    } else {
      console.warn('⚠️ Socket desconectado, recargando mensajes...');
      await loadMessages();
    }

  } catch (error) {
    console.error("❌ Error al enviar:", error);
    alert(`Error: ${error.message}`);
    setMessage(messageToSend); // Restaurar mensaje si falla
  }
};

  const sendFile = (type) => {
    console.log(`Enviando archivo de tipo: ${type}`);
    alert(`Función de envío de ${type} - Próximamente disponible`);
  };

  const shareLocation = () => {
    console.log("Compartiendo ubicación");
    alert("Compartiendo ubicación actual...");
  };

  const startVideoCall = () => {
    console.log("Iniciando videollamada");
    
    // Determinar si es grupal o privada
    const isGroup = chatData.tipo_Chat === 'grupal';
    
    setVideoCallType(isGroup ? 'grupal' : 'privada');
    setShowVideoCall(true);
  };

  const startVoiceCall = () => {
    console.log("Iniciando llamada de voz");
    // Por ahora usar videollamada con solo audio
    setVideoCallType('privada');
    setShowVideoCall(true);
  };

    return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header del chat */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              disabled={showVideoCall} // ← BLOQUEAR durante videollamada
              className={`p-2 rounded-lg transition-colors ${
                showVideoCall 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">
                {chatData.tipo_Chat === "grupal" ? "👥" : "👤"}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {chatData.nombre_Chat_display||chatData.nombre_Chat || "Chat Privado"}
              </h3>
              <p className="text-xs text-gray-500">
                {chatData.tipo_Chat === "grupal"
                  ? `${chatData.total_participantes || 0} participantes`
                  : "En línea"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={startVoiceCall}
              disabled={showVideoCall} // ← BLOQUEAR durante videollamada
              className={`p-2 rounded-lg transition-colors ${
                showVideoCall
                  ? 'opacity-50 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={startVideoCall}
              disabled={showVideoCall} // ← BLOQUEAR durante videollamada
              className={`p-2 rounded-lg transition-colors ${
                showVideoCall
                  ? 'opacity-50 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => setEncryptionEnabled(!encryptionEnabled)}
              disabled={showVideoCall} // ← BLOQUEAR durante videollamada
              className={`p-2 rounded-lg transition-colors ${
                showVideoCall
                  ? 'opacity-50 cursor-not-allowed'
                  : encryptionEnabled
                  ? "bg-green-100 text-green-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {encryptionEnabled ? (
                <Shield className="w-5 h-5" />
              ) : (
                <ShieldOff className="w-5 h-5" />
              )}
            </button>
            <button 
              disabled={showVideoCall} // ← BLOQUEAR durante videollamada
              className={`p-2 rounded-lg transition-colors ${
                showVideoCall
                  ? 'opacity-50 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* CAMBIO PRINCIPAL: RENDERIZADO CONDICIONAL */}
      {/* ========================================== */}
      {showVideoCall ? (
        // ✅ SI HAY VIDEOLLAMADA: Mostrar VideoCall (REEMPLAZA el área de mensajes)
        <VideoCall
          chatData={chatData}
          currentUser={{
            id_Usuario: currentUserId,
            nombre_Usuario: userName,
          }}
          onClose={() => setShowVideoCall(false)}
          isGroupCall={videoCallType === 'grupal'}
        />
      ) : (
        // ✅ SI NO HAY VIDEOLLAMADA: Mostrar mensajes normales
        <>
          {/* Contenido - Mensajes */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Cargando mensajes...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay mensajes aún</p>
                    <p className="text-sm">Envía el primer mensaje</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const messageContent = msg.message || msg.contenido || '';
                    const messageSender = msg.sender || msg.nombre_Usuario || 'Usuario';
                    const messageTime = msg.time || msg.timeString || 'Ahora';
                    const messageId = msg.id || msg.id_Mensaje || index;

                    return (
                      <div
                        key={messageId}
                        className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            msg.isOwn
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                          }`}
                        >
                          {!msg.isOwn && (
                            <p className="text-xs font-semibold mb-1 opacity-75">
                              {messageSender}
                            </p>
                          )}
                          <p className="break-words">
                            {msg.encrypted && "🔒 "}
                            {messageContent}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isOwn ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {messageTime}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input de mensajes */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => sendFile("image")}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 bg-gray-100 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const NewChatModal = ({ 
  show,
  newChatType, 
  setNewChatType,
  groupName,
  setGroupName,
  allUsers,
  selectedUsers,
  toggleUserSelection,
  closeModal,
  handleCreateChat 
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-md">
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={closeModal}
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(8px)",
        }}
      ></div>

      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Nuevo Chat</h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {!newChatType ? (
            <div className="space-y-3">
              <button
                onClick={() => setNewChatType("privado")}
                className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-colors flex items-center space-x-3"
              >
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900">Chat Privado</div>
                  <div className="text-sm text-blue-600">Conversa con un usuario</div>
                </div>
              </button>
              
              <button
                onClick={() => setNewChatType("grupal")}
                className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-colors flex items-center space-x-3"
              >
                <Users className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-semibold text-purple-900">Chat Grupal</div>
                  <div className="text-sm text-purple-600">Crea un grupo con varios usuarios</div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {newChatType === "grupal" && (
                <div>
                  {/* 🔧 FIX: Cambiar text-gray-700 a text-gray-900 */}
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nombre del grupo
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ej: Amigos del Mundial"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    autoFocus
                  />
                </div>
              )}

              <div>
                {/* 🔧 FIX: Cambiar text-gray-700 a text-gray-900 */}
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Selecciona usuarios
                </label>
                <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {allUsers.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No hay usuarios disponibles
                    </div>
                  ) : (
                    allUsers.map((user) => (
                      <button
                        key={user.id_Usuario}
                        onClick={() => toggleUserSelection(user.id_Usuario)}
                        className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                          selectedUsers.includes(user.id_Usuario)
                            ? "bg-blue-50 border-2 border-blue-500"
                            : "bg-white border-2 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm">
                              {user.nombre_Usuario?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.nombre_Usuario}
                            </div>
                            <div className={`text-xs ${user.Estado == 1 ? "text-green-600" : "text-gray-500"}`}>
                              {user.Estado == 1 ? "En línea" : "Desconectado"}
                            </div>
                          </div>
                        </div>
                        {selectedUsers.includes(user.id_Usuario) && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateChat}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Crear Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatType, setNewChatType] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userName, setUserName] = useState("Usuario");
  const [userPoints, setUserPoints] = useState(0);
  const [allUsers, setAllUsers] = useState([]); // <--- NUEVO: Estado para todos los usuarios de la DB

  const shopRef = useRef(null);

  // Socket.IO - Conexión global al Dashboard
  const {
    isConnected,
    isReconnecting, // NUEVO
    joinChat,
    leaveChat,
    sendMessage: sendSocketMessage,
    onMessageReceived,
    offMessageReceived,
    onGlobalEvent,
    offGlobalEvent,
  } = useSocket(currentUserId, userName);

  // 1. Mostrar estado de conexión en consola
  useEffect(() => {
    if (isConnected) {
      console.log("✅ Socket.IO conectado globalmente");
      showAlertMessage("Conectado al servidor en tiempo real");
    } else if (isReconnecting) {
      console.log("🔄 Socket.IO reconectando...");
      showAlertMessage("Reconectando al servidor...");
    } else {
      console.log("⏳ Socket.IO desconectado");
    }
  }, [isConnected, isReconnecting]);

  // 2. Escuchar nuevos mensajes en CUALQUIER chat para actualizar la lista
  useEffect(() => {
    if (!isConnected) return;

    console.log("👂 Escuchando mensajes globales...");

    // Cuando llega un mensaje a cualquier chat
    const handleGlobalMessage = (messageData) => {
      console.log("📩 Nuevo mensaje recibido:", messageData);
      console.log("   - Chat ID:", messageData.chatId);
      console.log("   - Mensaje:", messageData.message);
      console.log("   - Remitente:", messageData.senderName);

      // Actualizar el último mensaje del chat en la lista
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id_Chat === messageData.chatId) {
            return {
              ...chat,
              ultimo_mensaje: messageData.message,
              // Agregar badge de "no leído" si no es el chat activo
              hasUnread:
                !selectedChat || selectedChat.id_Chat !== messageData.chatId,
              // Actualizar timestamp (opcional)
              fecha_ultimo_mensaje: new Date().toISOString(),
            };
          }
          return chat;
        })
      );
    };

    onGlobalEvent("message:received", handleGlobalMessage);

    // Limpiar el listener al desmontar
    return () => {
      console.log("🧹 Limpiando listener de mensajes globales");
      offGlobalEvent("message:received");
    };
  }, [isConnected, selectedChat]);

  // 3. Escuchar cuando se crea un nuevo chat donde el usuario está incluido
  useEffect(() => {
    if (!isConnected) return;

    console.log("👂 Escuchando creación de nuevos chats...");

    const handleNewChat = (newChatData) => {
      console.log("🆕 Nuevo chat creado:", newChatData);

      // Recargar la lista de chats para incluir el nuevo
      loadChats();

      // Mostrar notificación al usuario
      showAlertMessage(
        `Nuevo chat creado: ${newChatData.nombre || "Chat sin nombre"}`
      );
    };

    onGlobalEvent("chat:created", handleNewChat);

    // Limpiar el listener al desmontar
    return () => {
      console.log("🧹 Limpiando listener de nuevos chats");
      offGlobalEvent("chat:created");
    };
  }, [isConnected]);

  // Mock de quinielas y tareas (ahora en Dashboard para mostrarse en el sidebar derecho)
  const [quinielas, setQuinielas] = useState([
    {
      id: 1,
      name: "Argentina vs Francia",
      description: "¿Quién ganará la final?",
      participants: 2,
      totalPoints: 1000,
      userBet: 500,
      status: "active",
      endTime: "2024-03-20 16:00",
      createdBy: "Ana García",
    },
    {
      id: 2,
      name: "Goleador del partido",
      description: "¿Quién anotará primero?",
      participants: 2,
      totalPoints: 600,
      userBet: null,
      status: "active",
      endTime: "2024-03-20 15:00",
      createdBy: "Tú",
    },
  ]);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Compartir predicción",
      description: "Comparte tu predicción para el próximo partido",
      points: 150,
      completed: false,
      completedBy: [],
    },
    {
      id: 2,
      name: "Enviar ubicación del estadio",
      description: "Comparte la ubicación de donde verás el partido",
      points: 100,
      completed: true,
      completedBy: ["Ana García"],
    },
    {
      id: 3,
      name: "Intercambiar datos curiosos",
      description: "Comparte un dato curioso sobre el mundial",
      points: 200,
      completed: false,
      completedBy: [],
    },
  ]);

  const [showNewQuinielaModal, setShowNewQuinielaModal] = useState(false);

  // Cargar usuario actual
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // Obtener el usuario directamente del localStorage
        const usuarioStr = localStorage.getItem("usuario");
        const token = localStorage.getItem("token");

        console.log("🔍 Verificando autenticación...");
        console.log("👤 Usuario en localStorage:", usuarioStr);
        console.log(
          "🔑 Token en localStorage:",
          token ? "Presente" : "No disponible"
        );

        if (!token) {
          console.warn("⚠️ No hay token de autenticación");
          showAlertMessage("Por favor, inicia sesión primero");
          return;
        }

        if (usuarioStr) {
          const usuario = JSON.parse(usuarioStr);
          console.log("✅ Usuario cargado:", usuario);
          setCurrentUserId(usuario.id_Usuario);
          setUserName(usuario.nombre_Usuario || "Usuario");
          setUserPoints(parseInt(usuario.Puntos) || 0);
        } else {
          console.warn("⚠️ No hay usuario en localStorage");
          showAlertMessage("No se encontró información del usuario");
        }
      } catch (error) {
        console.error("❌ Error al cargar usuario:", error);
        showAlertMessage("Error al cargar información del usuario");
      }
    };
    loadCurrentUser();
  }, []);

  // Cargar chats
  useEffect(() => {
    loadChats();
  }, []);

  // NUEVO: Cargar todos los usuarios para el modal de nuevo chat
  useEffect(() => {
    loadAllUsers();
  }, []);

  // Nueva función para cargar todos los usuarios
  const loadAllUsers = async () => {
    try {
      // Verificar token antes de hacer la petición
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn(
          "⚠️ No hay token, no se puede cargar la lista de usuarios"
        );
        return;
      }

      console.log("📥 Cargando lista de usuarios...");
      const response = await userService.obtenerTodos(); // Usamos el nuevo servicio

      if (response.success) {
        console.log("✅ Lista de usuarios cargada:", response.data);
        // La API devuelve un array de objetos con las propiedades del modelo Usuario
        setAllUsers(response.data);
      } else {
        console.warn("⚠️ Error al cargar usuarios:", response);
        // Solo mostramos el error si no hay chats
        if (chats.length === 0) {
          showAlertMessage(
            "Error al cargar la lista de usuarios para nuevos chats"
          );
        }
      }
    } catch (error) {
      console.error("❌ Error al cargar usuarios:", error);
      // Solo mostramos el error si no hay chats
      if (chats.length === 0) {
        showAlertMessage(
          "Error al cargar la lista de usuarios: " + error?.message
        );
      }
    }
  };

  const loadChats = async () => {
    try {
      setLoadingChats(true);

      // Verificar token antes de hacer la petición
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ No hay token, no se pueden cargar los chats");
        showAlertMessage("Por favor, inicia sesión para ver tus chats");
        setLoadingChats(false);
        return;
      }

      console.log("📥 Cargando chats...");
      const response = await chatService.obtenerMisChats();

      if (response.success) {
        console.log("✅ Chats cargados:", response.data);
        setChats(response.data);
      } else {
        console.warn("⚠️ La respuesta no indica éxito:", response);
        setChats([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar chats:", error);
      // Mostrar el mensaje del error si está disponible (por ejemplo: respuesta no JSON o mensaje del servidor)
      const msg =
        error?.message || "Error al cargar los chats. Verifica tu conexión.";
      showAlertMessage(msg);
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shopRef.current && !shopRef.current.contains(event.target)) {
        setShowShopDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock de iconos de la tienda
  const shopIcons = [
    { id: 1, name: "Balón de Oro", icon: "⚽", price: 500, rarity: "common" },
    { id: 2, name: "Copa Mundial", icon: "🏆", price: 1000, rarity: "rare" },
    { id: 3, name: "Estrella", icon: "⭐", price: 750, rarity: "common" },
    { id: 4, name: "Fuego", icon: "🔥", price: 1200, rarity: "epic" },
    { id: 5, name: "Corona", icon: "👑", price: 2000, rarity: "legendary" },
  ];

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleCreateChat = async () => {
    if (newChatType === "privado" && selectedUsers.length !== 1) {
      showAlertMessage("Selecciona un usuario para el chat privado");
      return;
    }

    if (newChatType === "grupal") {
      if (selectedUsers.length < 2) {
        showAlertMessage("Selecciona al menos 2 usuarios para el chat grupal");
        return;
      }
      if (!groupName.trim()) {
        showAlertMessage("Ingresa un nombre para el grupo");
        return;
      }
    }

    try {
      let response;
      if (newChatType === "privado") {
        response = await chatService.crearChatPrivado(selectedUsers[0]);
      } else {
        response = await chatService.crearChatGrupal(groupName, selectedUsers);
      }

      if (response.success) {
        showAlertMessage(
          `Chat ${
            newChatType === "grupal" ? "grupal" : "privado"
          } creado exitosamente!`
        );
        closeModal();
        await loadChats(); // Recargar la lista de chats
      }
    } catch (error) {
      console.error("Error al crear chat:", error);
      showAlertMessage("Error al crear el chat");
    }
  };

  const toggleUserSelection = (userId) => {
    if (newChatType === "privado") {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const closeModal = () => {
    setShowNewChatModal(false);
    setNewChatType("");
    setSelectedUsers([]);
    setGroupName("");
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  const handleBackToDashboard = () => {
    setSelectedChat(null);
  };

  const handleBuyIcon = (icon) => {
    if (userPoints < icon.price) {
      showAlertMessage(
        `No tienes suficientes puntos. Necesitas ${icon.price} puntos.`
      );
      return;
    }

    showAlertMessage(`¡Compraste ${icon.name} por ${icon.price} puntos!`);
    setShowShopDropdown(false);
  };

  const Alert = () => (
    <div
      className={`fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 transform transition-all duration-300 ${
        showAlert ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium">{alertMessage}</span>
    </div>
  );

  const NewQuinielaModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowNewQuinielaModal(false)}
      ></div>
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Nueva Quiniela</h3>
        <p className="text-gray-600 mb-4">
          Funcionalidad próximamente disponible
        </p>
        <button
          onClick={() => setShowNewQuinielaModal(false)}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );

  return (
    
    <div className="min-h-screen bg-gray-50">
      <Alert />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">⚽</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Vive Mundial</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-800">{userPoints}</span>
              </div>

              <div className="relative" ref={shopRef}>
                <button
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setShowShopDropdown((prev) => !prev)}
                >
                  <ShoppingBag className="w-6 h-6" />
                  <span className="hidden md:block text-sm font-medium">
                    Tienda
                  </span>
                </button>

                {showShopDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          <ShoppingBag className="w-5 h-5 mr-2 text-yellow-600" />
                          Tienda de Iconos
                        </h3>
                        <div className="flex items-center space-x-1 bg-yellow-200 px-2 py-1 rounded-lg">
                          <Coins className="w-4 h-4 text-yellow-700" />
                          <span className="text-sm font-bold text-yellow-800">
                            {userPoints}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto p-4">
                      {shopIcons.map((icon) => (
                        <div
                          key={icon.id}
                          className="mb-3 p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                                {icon.icon}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {icon.name}
                                </div>
                                <div className="flex items-center space-x-1 text-yellow-600">
                                  <Coins className="w-3 h-3" />
                                  <span className="text-sm font-medium">
                                    {icon.price} puntos
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleBuyIcon(icon)}
                              disabled={userPoints < icon.price}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                userPoints >= icon.price
                                  ? "bg-blue-500 text-white hover:bg-blue-600"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {userPoints >= icon.price
                                ? "Comprar"
                                : "Sin puntos"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-gray-50 text-center">
                      <p className="text-xs text-gray-600">
                        ¡Gana más puntos participando en quinielas y completando
                        tareas!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                <Settings className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-800">{userName}</span>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar izquierdo - Lista de Chats */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Mis Chats</h2>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Cargando chats...</div>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">No tienes chats</p>
                <p className="text-sm text-gray-500">
                  Crea uno nuevo para comenzar
                </p>
              </div>
            ) : (
              chats
                .filter((chat) =>
                  (chat.nombre_Chat_display || chat.nombre_Chat || "Chat")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((chat) => ( 
                  <button
                    key={chat.id_Chat}
                    onClick={() => handleChatClick(chat)}
                    className={`w-full p-4 hover:bg-gray-50 border-b border-gray-100 text-left transition-colors ${
                      selectedChat?.id_Chat === chat.id_Chat ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg">
                          {chat.tipo_Chat === "grupal" ? "👥" : "👤"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {chat.nombre_Chat_display || chat.nombre_Chat || "Chat Privado"}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {chat.tipo_Chat === "grupal" &&
                              `${chat.total_participantes || 0} 👥`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.ultimo_mensaje || "Sin mensajes"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>

        {/* Contenido principal - Columna central */}
        {selectedChat ? (
          <PrivateChat
            chatData={selectedChat}
            onBack={handleBackToDashboard}
            currentUserId={currentUserId}
            userName={userName}
            // Props de Socket.IO
            isConnected={isConnected}
            joinChat={joinChat}
            leaveChat={leaveChat}
            sendSocketMessage={sendSocketMessage}
            onMessageReceived={onMessageReceived}
            offMessageReceived={offMessageReceived}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Bienvenido a Vive Mundial
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Selecciona un chat de la lista o crea uno nuevo para comenzar a
                conversar
              </p>
            </div>
          </div>
        )}

        {/* Sidebar derecho - Información adicional */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-6">
            {selectedChat ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Quinielas</h3>
                  <button
                    onClick={() => setShowNewQuinielaModal(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Nueva
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {quinielas.map((q) => (
                    <div
                      key={q.id}
                      className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {q.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {q.description}
                          </p>
                        </div>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{q.participants} participantes</span>
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <Coins className="w-4 h-4" />
                          <span className="font-medium">
                            {q.totalPoints} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Tareas
                  </h3>
                  <div className="space-y-4">
                    {tasks.map((t) => (
                      <div
                        key={t.id}
                        className={`bg-white rounded-xl p-4 border-2 transition-all ${
                          t.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {t.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {t.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 text-green-600">
                            <Coins className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {t.points}
                            </span>
                          </div>
                        </div>
                        {t.completedBy.length > 0 && (
                          <div className="text-xs text-gray-600 mb-2">
                            Completado por: {t.completedBy.join(", ")}
                          </div>
                        )}
                        <button
                          disabled={t.completed}
                          className={`w-full py-2 text-sm rounded-lg transition-colors ${
                            t.completed
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {t.completed ? "✓ Completada" : "Completar Tarea"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Actividades
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-4 bg-blue-100 hover:bg-blue-200 rounded-xl text-left transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-blue-800">
                          Quinielas Activas
                        </div>
                        <div className="text-xs text-blue-600">
                          Participar y ganar puntos
                        </div>
                      </div>
                      <span className="text-xs bg-blue-300 text-blue-800 px-2 py-1 rounded-full font-bold">
                        5
                      </span>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-green-100 hover:bg-green-200 rounded-xl text-left transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-green-800">
                          Tareas Pendientes
                        </div>
                        <div className="text-xs text-green-600">
                          Completar para ganar puntos
                        </div>
                      </div>
                      <span className="text-xs bg-green-300 text-green-800 px-2 py-1 rounded-full font-bold">
                        3
                      </span>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-purple-100 hover:bg-purple-200 rounded-xl text-left transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-purple-800">
                          Tienda
                        </div>
                        <div className="text-xs text-purple-600">
                          Comprar iconos
                        </div>
                      </div>
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showNewChatModal && <NewChatModal 
  show={showNewChatModal}
  newChatType={newChatType}
  setNewChatType={setNewChatType}
  groupName={groupName}
  setGroupName={setGroupName}
  allUsers={allUsers}
  selectedUsers={selectedUsers}
  toggleUserSelection={toggleUserSelection}
  closeModal={closeModal}
  handleCreateChat={handleCreateChat}/>}
    </div>
  );
};

export default Dashboard;
