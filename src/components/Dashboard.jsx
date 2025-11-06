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
import videoCallService from "../services/videoCallService";
import { useSocket } from "../hooks/useSocket";
import VideoCall from "./VideoCall"; // Componente de videollamadas
import tareaService from "../services/tareaService";
import quinielaService from "../services/quinielaService";
import tiendaService from "../services/tiendaService";
import Avatar from "./Avatar";

// Componente de Chat Privado integrado
const PrivateChat = ({
  chatData,
  onBack,
  currentUserId,
  userName,
  userPoints,        
  setUserPoints,     
  user,              
  setUser,           
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
  const [videoCallType, setVideoCallType] = useState("privada");
  const [incomingCall, setIncomingCall] = useState(null); // { roomName, callerName, callerId }
  const [joinRoomName, setJoinRoomName] = useState(null); // Para unirse a sala existente
const [tasks, setTasks] = useState([]);
const [loadingTasks, setLoadingTasks] = useState(false);
const [showNewTaskModal, setShowNewTaskModal] = useState(false);
const [newTaskData, setNewTaskData] = useState({
  titulo: '',
  descripcion: '',
  puntos_Recompensa: 10
});
  // Cargar mensajes del chat
  useEffect(() => {
    if (chatData?.id_Chat) {
      loadMessages();
    }
  }, [chatData?.id_Chat]);

  useEffect(() => {
  // Solo cargar tareas si es chat GRUPAL
  if (chatData?.id_Chat && chatData?.tipo_Chat === 'grupal') {
    console.log('📋 Cargando tareas del chat grupal:', chatData.id_Chat);
    loadTasks(chatData.id_Chat);
  } else {
    // Si es chat privado, limpiar tareas
    console.log('ℹ️ Chat privado, no hay tareas');
    setTasks([]);
  }
}, [chatData?.id_Chat, chatData?.tipo_Chat]);

  useEffect(() => {
    if (chatData?.id_Chat && isConnected) {
      console.log("🔗 Uniéndose al chat:", chatData.id_Chat);
      joinChat(chatData.id_Chat);

      // Cleanup: salir del chat cuando se cierre o cambie
      return () => {
        console.log("👋 Saliendo del chat:", chatData.id_Chat);
        leaveChat(chatData.id_Chat);
      };
    }
  }, [chatData?.id_Chat, isConnected]);

  // Escuchar mensajes en tiempo real del chat actual
  useEffect(() => {
    if (!isConnected || !chatData?.id_Chat) return;

    console.log(
      "👂 Escuchando mensajes en tiempo real para chat:",
      chatData.id_Chat
    );

    const handleNewMessage = (messageData) => {
      console.log("📨 Mensaje/Evento recibido por WebSocket:", messageData);
      console.log("🔍 Tipo de mensaje:", messageData.type);
      console.log("🔍 Todos los campos:", Object.keys(messageData));
      // ✨ NUEVO: Detectar notificación de videollamada
      if (
        messageData.type === "video_call_start" &&
        messageData.chatId === chatData.id_Chat
      ) {
        console.log("🔔 Notificación de videollamada recibida");

        // Solo mostrar notificación si NO soy el que inició la llamada
        if (messageData.callerId !== currentUserId) {
          setIncomingCall({
            roomName: messageData.roomName,
            callerName: messageData.callerName,
            callerId: messageData.callerId,
          });
        }
        return; // No procesar como mensaje normal
      }
      //Detectar evento de tarea creada
if (messageData.type === 'task_created' && messageData.chatId === chatData.id_Chat) {
  console.log('📋 Nueva tarea creada por otro usuario');
  loadTasks(chatData.id_Chat);
  return;
}

//Detectar evento de tarea completada
if (messageData.type === 'task_completed' && messageData.chatId === chatData.id_Chat) {
  console.log('✅ Tarea completada por otro usuario');
  alert(`${messageData.completedBy} completó una tarea (+${messageData.puntosGanados} pts)`);
  loadTasks(chatData.id_Chat);
  return;
}
// Detectar cuando se agrega una quiniela
      if (messageData.type === 'quiniela_added' && messageData.chatId === chatData.id_Chat) {
        console.log('🏆 Nueva quiniela agregada al chat');
        if (window.loadQuinielasFromSocket) {
          window.loadQuinielasFromSocket(chatData.id_Chat);
        }
        return;
      }

      // Detectar cuando alguien participa en una quiniela
      if (messageData.type === 'quiniela_participated' && messageData.chatId === chatData.id_Chat) {
        console.log('🎲 Usuario participó en quiniela:', messageData.usuario);
        if (window.loadQuinielasFromSocket) {
          window.loadQuinielasFromSocket(chatData.id_Chat);
        }
        return;
      }

// Detectar cuando una quiniela es finalizada
if (messageData.type === 'quiniela_finished' && messageData.chatId === chatData.id_Chat) {
  console.log('🏁 Quiniela finalizada por otro usuario');
  
  alert(`🏁 Quiniela finalizada!\nResultado: ${messageData.resultado}`);

  if (window.recargarPuntosUsuario) {
    window.recargarPuntosUsuario();
  }
  
  // Recargar quinielas del chat
  if (window.loadQuinielasFromSocket) {
    window.loadQuinielasFromSocket(chatData.id_Chat);
  }
  
  return;
}
      // Solo agregar si es del chat actual y es mensaje normal
      if (
        messageData.chatId === chatData.id_Chat &&
        messageData.type !== "video_call_start"
      ) {
        // ... resto del código de formateo de mensajes (NO TOCAR el resto)
        const formattedMessage = {
          id: messageData.messageId,
          id_Mensaje: messageData.messageId,
          message: messageData.message,
          contenido: messageData.message,
          sender: messageData.senderName,
          nombre_Usuario: messageData.senderName,
          time: new Date(messageData.timestamp).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timeString: new Date(messageData.timestamp).toLocaleTimeString(
            "es-MX",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
          isOwn: messageData.senderId === currentUserId,
          tipo_Mensaje: messageData.type || "texto",
          cifrado: messageData.encrypted || false,

          // Datos de archivo (si existe)
          url_Archivo: messageData.url_Archivo || null,
          nombre_Archivo: messageData.nombre_Archivo || null,
          tamano_Archivo: messageData.tamano_Archivo || null,
        };

        console.log("📝 Mensaje formateado:", formattedMessage);

        setMessages((prevMessages) => {
          const exists = prevMessages.some(
            (msg) =>
              msg.id === formattedMessage.id ||
              msg.id_Mensaje === formattedMessage.id_Mensaje
          );

          if (exists) {
            console.log("⚠️ Mensaje duplicado ignorado:", formattedMessage.id);
            return prevMessages;
          }

          console.log("✅ Agregando mensaje nuevo al estado");
          return [...prevMessages, formattedMessage];
        });
      }
    };
    // Registrar el listener
    onMessageReceived(handleNewMessage);

    // Cleanup
    return () => {
      console.log(
        "🧹 Limpiando listener de mensajes del chat:",
        chatData.id_Chat
      );
      offMessageReceived();
    };
  }, [chatData?.id_Chat, isConnected, currentUserId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log("🔍 Cargando mensajes del chat:", chatData.id_Chat);
      console.log(
        "👤 currentUserId:",
        currentUserId,
        "Tipo:",
        typeof currentUserId
      );

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
            console.log(
              `   - id_Remitente: ${
                msg.id_Remitente
              } (tipo: ${typeof msg.id_Remitente})`
            );
            console.log(
              `   - currentUserId: ${currentUserId} (tipo: ${typeof currentUserId})`
            );
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
            tipo: msg.tipo_Mensaje || "texto",
            tipo_Mensaje: msg.tipo_Mensaje || "texto",
            encrypted: msg.encriptado === 1 || msg.encriptado === true,
            cifrado: msg.encriptado === 1 || msg.encriptado === true,

            // Identificar si es mensaje propio (CONVERSIÓN ARREGLADA)
            isOwn: esMio, // ← USANDO LA COMPARACIÓN ARREGLADA
            id_Usuario: msg.id_Remitente,
            id_Remitente: msg.id_Remitente,
            // Datos de archivo (si existe)
            url_Archivo: msg.url_Archivo || null,
            nombre_Archivo: msg.nombre_Archivo || null,
            tamano_Archivo: msg.tamano_Archivo || null,
          };

          return formattedMsg;
        });

        setMessages(formattedMessages);
        console.log(
          "✅ Mensajes cargados y formateados:",
          formattedMessages.length
        );
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
      console.warn("⚠️ Mensaje vacío, no se envía");
      return;
    }

    if (!chatData?.id_Chat || !currentUserId) {
      console.error("❌ Faltan datos necesarios");
      alert("Error: No se puede enviar el mensaje");
      return;
    }

    const messageToSend = message.trim();
    setMessage(""); // Limpiar input inmediatamente

    try {
      console.log("📤 Enviando mensaje...");

      // 1. Guardar en base de datos
      const response = await chatService.enviarMensaje(
        chatData.id_Chat,
        messageToSend,
        encryptionEnabled,
        "texto"
      );

      console.log("✅ Mensaje guardado en BD:", response);

      if (!response || !response.success) {
        throw new Error("Error al guardar el mensaje");
      }

      // 2. Emitir por WebSocket
      if (isConnected) {
        const messageData = {
          chatId: chatData.id_Chat,
          message: messageToSend,
          senderId: currentUserId,
          senderName: userName || "Usuario",
          messageId: response.data?.id_Mensaje || Date.now(),
          timestamp: new Date().toISOString(),
          type: "texto",
          encrypted: encryptionEnabled,
        };

        console.log("🔌 Emitiendo por WebSocket:", messageData);
        sendSocketMessage(messageData);
      } else {
        console.warn("⚠️ Socket desconectado, recargando mensajes...");
        await loadMessages();
      }
    } catch (error) {
      console.error("❌ Error al enviar:", error);
      alert(`Error: ${error.message}`);
      setMessage(messageToSend); // Restaurar mensaje si falla
    }
  };


  const sendFile = async (type) => {
    // Crear input invisible para seleccionar archivo
    const input = document.createElement("input");
    input.type = "file";

    // Configurar tipos aceptados según el botón clickeado
    if (type === "image") {
      input.accept = "image/*";
    } else if (type === "archivo") {
      input.accept = ".pdf,.doc,.docx,.txt,.xlsx,.xls";
    }

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("El archivo es muy grande (máx 10MB)");
        return;
      }

      try {
        console.log("📤 Enviando archivo:", file.name);

        // Subir archivo
        const formData = new FormData();
        formData.append("archivo", file);
        formData.append("id_Chat", chatData.id_Chat);
        formData.append("tipo", type === "image" ? "imagen" : "archivo");
        formData.append("encriptado", encryptionEnabled);

        const response = await chatService.enviarArchivo(formData);

        if (response.success) {
          console.log("✅ Archivo subido exitosamente:", response.data);

          // Emitir por WebSocket
          if (isConnected) {
            sendSocketMessage({
              chatId: chatData.id_Chat,
              message: file.name,
              senderId: currentUserId,
              senderName: userName,
              messageId: response.data.id_Mensaje,
              timestamp: new Date().toISOString(),
              type: response.data.tipo_Mensaje,
              encrypted: encryptionEnabled,
              fileUrl: response.data.url_Archivo,
              fileName: response.data.nombre_Archivo,
              fileSize: response.data.tamano_Archivo,
            });
          } else {
            await loadMessages();
          }
        }
      } catch (error) {
        console.error("❌ Error al enviar archivo:", error);
        alert("Error al enviar el archivo: " + error.message);
      }
    };

    input.click();
  };

  const shareLocation = async () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    console.log("📍 Obteniendo ubicación...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Crear el link de Google Maps directamente
        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

        // El mensaje será el link completo
        const ubicacionTexto = googleMapsLink;

        try {
          console.log("📤 Enviando ubicación:", ubicacionTexto);

          // Guardar en base de datos
          const response = await chatService.enviarMensaje(
            chatData.id_Chat,
            ubicacionTexto,
            encryptionEnabled,
            "ubicacion"
          );

          if (response.success) {
            console.log("✅ Ubicación enviada exitosamente");

            // Emitir por WebSocket
            if (isConnected) {
              sendSocketMessage({
                chatId: chatData.id_Chat,
                message: ubicacionTexto,
                senderId: currentUserId,
                senderName: userName,
                messageId: response.data?.id_Mensaje || Date.now(),
                timestamp: new Date().toISOString(),
                type: "ubicacion",
                encrypted: encryptionEnabled,
              });
            } else {
              await loadMessages();
            }
          }
        } catch (error) {
          console.error("❌ Error al enviar ubicación:", error);
          alert("Error al enviar la ubicación: " + error.message);
        }
      },
      (error) => {
        console.error("❌ Error al obtener ubicación:", error);
        alert(
          "No se pudo obtener tu ubicación. Verifica los permisos del navegador."
        );
      }
    );
  };

  const startVideoCall = async () => {
    console.log("📞 Iniciando videollamada y notificando...");

    const isGroup = chatData.tipo_Chat === "grupal";
    setVideoCallType(isGroup ? "grupal" : "privada");

    try {
      // 1. Crear la llamada en el backend PRIMERO para obtener el roomName real
      const callResponse = await videoCallService.iniciarLlamada(
        chatData.id_Chat,
        isGroup ? "grupal" : "privada"
      );

      const realRoomName = callResponse.data.roomName;
      console.log("🎯 RoomName real generado:", realRoomName);

      // 2. Guardar el roomName para que VideoCall lo use
      setJoinRoomName(realRoomName);

      // 3. Emitir notificación WebSocket con el roomName REAL
      if (isConnected) {
        sendSocketMessage({
          type: "video_call_start",
          chatId: chatData.id_Chat,
          roomName: realRoomName, // ← roomName REAL del backend
          callerId: currentUserId,
          callerName: userName,
          timestamp: new Date().toISOString(),
        });

        console.log("📡 Notificación enviada con roomName:", realRoomName);
      }

      // 4. Mostrar la videollamada
      setShowVideoCall(true);
    } catch (error) {
      console.error("❌ Error al iniciar videollamada:", error);
      alert("Error al iniciar la videollamada: " + error.message);
    }
  };

  // Aceptar llamada entrante
  const acceptIncomingCall = () => {
    console.log("✅ Aceptando llamada de:", incomingCall.callerName);

    setJoinRoomName(incomingCall.roomName); // Guardar roomName para pasarlo a VideoCall
    setVideoCallType("privada");
    setShowVideoCall(true);
    setIncomingCall(null); // Cerrar modal de notificación
  };

  // Rechazar llamada entrante
  const declineIncomingCall = () => {
    console.log("❌ Rechazando llamada de:", incomingCall.callerName);
    setIncomingCall(null);

    // Opcional: Notificar al otro usuario que rechazaste
    if (isConnected) {
      sendSocketMessage({
        type: "video_call_declined",
        chatId: chatData.id_Chat,
        userId: currentUserId,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const startVoiceCall = () => {
    console.log("Iniciando llamada de voz");
    // Por ahora usar videollamada con solo audio
    setVideoCallType("privada");
    setShowVideoCall(true);
  };
  // FUNCIONES DE TAREAS
  // ============================================

  /**
   * Cargar tareas de un chat desde el backend
   */
  const loadTasks = async (id_Chat) => {
    if (!id_Chat) {
      console.log('⚠️ No se puede cargar tareas sin id_Chat');
      return;
    }
    
    try {
      setLoadingTasks(true);
      console.log('📋 Cargando tareas del chat:', id_Chat);
      
      const response = await tareaService.listarTareas(id_Chat);
      
      if (response.success) {
        // Transformar el formato del backend al formato del frontend
        const tareasFormateadas = response.data.tareas.map(tarea => ({
          id: tarea.id_Tarea,
          name: tarea.titulo,
          description: tarea.descripcion,
          points: tarea.puntos_Recompensa,
          completed: tarea.estado === 'completada',
          completedBy: tarea.completada_por_nombre ? [tarea.completada_por_nombre] : [],
          createdBy: tarea.creador_nombre,
          creado_Por: tarea.creado_Por // Para validaciones (ID numérico)
        }));
        
        setTasks(tareasFormateadas);
        console.log('✅ Tareas cargadas:', tareasFormateadas.length, 'tareas');
      }
    } catch (error) {
      console.error('❌ Error al cargar tareas:', error);
      // No mostrar alert para no molestar al usuario
      setTasks([]); // Dejar vacío en caso de error
    } finally {
      setLoadingTasks(false);
    }
  };

  /**
   * Crear una nueva tarea
   */
  const handleCrearTarea = async () => {
    if (!newTaskData.titulo.trim()) {
      alert('El título de la tarea es obligatorio');
      return;
    }
    
    if (!chatData?.id_Chat) {
      alert('Error: No hay chat seleccionado');
      return;
    }
    
    try {
      console.log('📝 Creando tarea con datos:', newTaskData);
      
      const response = await tareaService.crearTarea(
        chatData.id_Chat,
        newTaskData.titulo,
        newTaskData.descripcion,
        newTaskData.puntos_Recompensa
      );
      
      if (response.success) {
        alert('✅ Tarea creada exitosamente');
        
        // Cerrar modal
        setShowNewTaskModal(false);
        
        // Limpiar formulario
        setNewTaskData({
          titulo: '',
          descripcion: '',
          puntos_Recompensa: 10
        });
        
        // Recargar tareas
        loadTasks(chatData.id_Chat);
        
        // Emitir evento WebSocket para notificar a otros usuarios
        if (isConnected) {
          sendSocketMessage({
            type: 'task_created',
            chatId: chatData.id_Chat,
            task: response.data,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('❌ Error al crear tarea:', error);
      alert('Error: ' + error.message);
    }
  };

  /**
   * Completar una tarea
   */
  const handleCompletarTarea = async (id_Tarea) => {
    try {
      console.log('✅ Completando tarea:', id_Tarea);
      
      const response = await tareaService.completarTarea(id_Tarea);
      
      if (response.success) {
        alert(`🎉 ${response.message}`);
        
        // Recargar tareas para ver el cambio
        loadTasks(chatData.id_Chat);
        
        // Emitir evento WebSocket
        if (isConnected) {
          sendSocketMessage({
            type: 'task_completed',
            chatId: chatData.id_Chat,
            taskId: id_Tarea,
            completedBy: userName,
            puntosGanados: response.data.puntos_ganados,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('❌ Error al completar tarea:', error);
      alert('Error: ' + error.message);
    }
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
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
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
                {chatData.nombre_Chat_display ||
                  chatData.nombre_Chat ||
                  "Chat Privado"}
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
                  ? "opacity-50 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={startVideoCall}
              disabled={showVideoCall} // ← BLOQUEAR durante videollamada
              className={`p-2 rounded-lg transition-colors ${
                showVideoCall
                  ? "opacity-50 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => setEncryptionEnabled(!encryptionEnabled)}
              disabled={showVideoCall} // ← BLOQUEAR durante videollamada
              className={`p-2 rounded-lg transition-colors ${
                showVideoCall
                  ? "opacity-50 cursor-not-allowed"
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
                  ? "opacity-50 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
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
          onClose={() => {
            setShowVideoCall(false);
            setJoinRoomName(null); // Limpiar roomName al cerrar
          }}
          isGroupCall={videoCallType === "grupal"}
          roomName={joinRoomName} //Pasar roomName si se está uniendo
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
              ) : (
                <div className="space-y-4">
                  {/* ========================================== */}
                  {/* NOTIFICACIÓN DE LLAMADA ENTRANTE */}
                  {/* ========================================== */}
                  {incomingCall && (
                    <div className="flex justify-center mb-4">
                      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 p-6 max-w-sm w-full animate-pulse">
                        <div className="flex flex-col items-center text-center">
                          {/* Icono de teléfono */}
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Phone className="w-8 h-8 text-white animate-bounce" />
                          </div>

                          {/* Título */}
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            📞 Llamada Entrante
                          </h3>

                          {/* Nombre del llamador */}
                          <p className="text-gray-600 mb-4">
                            <span className="font-semibold text-blue-600">
                              {incomingCall.callerName}
                            </span>{" "}
                            te está llamando
                          </p>

                          {/* Botones */}
                          <div className="flex gap-3 w-full">
                            <button
                              onClick={declineIncomingCall}
                              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                              ❌ Rechazar
                            </button>
                            <button
                              onClick={acceptIncomingCall}
                              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                              ✅ Aceptar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================== */}
                  {/* MENSAJES NORMALES */}
                  {/* ========================================== */}
                  {messages.length === 0 && !incomingCall ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No hay mensajes aún</p>
                        <p className="text-sm">Envía el primer mensaje</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const messageContent = msg.message || msg.contenido || "";
                      const messageSender =
                        msg.sender || msg.nombre_Usuario || "Usuario";
                      const messageTime = msg.time || msg.timeString || "Ahora";
                      const messageId = msg.id || msg.id_Mensaje || index;

                      return (
                        <div
                          key={messageId}
                          className={`flex ${
                            msg.isOwn ? "justify-end" : "justify-start"
                          }`}
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
                            {/* Renderizado según tipo de mensaje */}
                            {(() => {
                              const tipoMensaje =
                                msg.tipo_Mensaje || msg.tipo || "texto";

                              if (tipoMensaje === "imagen") {
                                return (
                                  <div>
                                    <img
                                      src={msg.url_Archivo}
                                      alt={msg.nombre_Archivo || "Imagen"}
                                      className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                                      style={{
                                        maxHeight: "300px",
                                        objectFit: "contain",
                                      }}
                                      onClick={() =>
                                        window.open(msg.url_Archivo, "_blank")
                                      }
                                    />
                                    <p className="text-xs opacity-75">
                                      {msg.nombre_Archivo}
                                    </p>
                                  </div>
                                );
                              } else if (tipoMensaje === "archivo") {
                                return (
                                  <div className="flex items-center space-x-3 p-2 bg-opacity-20 bg-black rounded-lg">
                                    <FileText className="w-8 h-8 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold truncate">
                                        {msg.nombre_Archivo}
                                      </p>
                                      <p className="text-xs opacity-75">
                                        {msg.tamano_Archivo
                                          ? (
                                              msg.tamano_Archivo /
                                              1024 /
                                              1024
                                            ).toFixed(2) + " MB"
                                          : "Archivo"}
                                      </p>
                                    </div>
                                    <a
                                      href={msg.url_Archivo}
                                      download
                                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                      title="Descargar"
                                    >
                                      📥
                                    </a>
                                  </div>
                                );
                              } else if (tipoMensaje === "ubicacion") {
                                // Asegurarse de que el link comience con http:// o https://
                                let locationUrl = messageContent;
                                if (
                                  !locationUrl.startsWith("http://") &&
                                  !locationUrl.startsWith("https://")
                                ) {
                                  // Si son solo coordenadas, construir el link
                                  locationUrl = `https://www.google.com/maps?q=${messageContent}`;
                                }

                                return (
                                  <div>
                                    <p className="mb-2">
                                      📍 Ubicación compartida
                                    </p>
                                    <a
                                      href={locationUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-xs underline hover:opacity-80 block ${
                                        msg.isOwn
                                          ? "text-blue-100"
                                          : "text-blue-600"
                                      }`}
                                    >
                                      🗺️ Ver en Google Maps
                                    </a>
                                  </div>
                                );
                              } else {
                                return (
                                  <p className="break-words">
                                    {msg.encrypted && "🔒 "}
                                    {messageContent}
                                  </p>
                                );
                              }
                            })()}
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
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input de mensajes */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                {/* Botones de archivos */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => sendFile("image")}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Enviar imagen"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => sendFile("archivo")}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Enviar archivo"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={shareLocation}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Compartir ubicación"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
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
  handleCreateChat,
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
                  <div className="font-semibold text-blue-900">
                    Chat Privado
                  </div>
                  <div className="text-sm text-blue-600">
                    Conversa con un usuario
                  </div>
                </div>
              </button>

              <button
                onClick={() => setNewChatType("grupal")}
                className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-colors flex items-center space-x-3"
              >
                <Users className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-semibold text-purple-900">
                    Chat Grupal
                  </div>
                  <div className="text-sm text-purple-600">
                    Crea un grupo con varios usuarios
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {newChatType === "grupal" && (
                <div>
                  
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
// NUEVO:
<button
  key={user.id_Usuario}
  onClick={() => toggleUserSelection(user.id_Usuario)}
  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
>
  <div className="flex items-center space-x-3">
    <Avatar 
      iconoPerfil={user.IconoPerfil} 
      size="md"
    />
    <div className="text-left">
      <div className="font-semibold text-gray-800">
        {user.nombre_Usuario}
      </div>
      <div
        className={`text-xs ${
          user.Estado == 1
            ? "text-green-600"
            : "text-gray-500"
        }`}
      >
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
  const [user, setUser] = useState({
  id_Usuario: null,
  nombre_Usuario: '',
  Puntos: 0
});
const [shopIcons, setShopIcons] = useState([]);           
const [userIcons, setUserIcons] = useState([]);           
const [equippedIcon, setEquippedIcon] = useState(null);   
const [loadingShop, setLoadingShop] = useState(false);    

  

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

// Escuchar cambios de iconos y estados de usuarios
useEffect(() => {
  // ✅ Verificar que el socket esté realmente conectado
  if (!isConnected) {
    console.log('⚠️ [Dashboard] Socket no conectado aún, esperando...');
    return;
  }

  console.log('✅ [Dashboard] Socket conectado, registrando listeners...');

  // Función auxiliar para verificar si el evento se recibe
  const testEventReceived = (eventName) => {
    console.log(`🎯 [Dashboard] Evento ${eventName} RECIBIDO en el socket`);
  };

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleIconEquipped = (data) => {
    testEventReceived('icon_equipped');
    console.log('🎨 [HANDLER] handleIconEquipped ejecutado:', data);
    console.log('📊 [HANDLER] Data recibida completa:', JSON.stringify(data, null, 2));
    
    // Actualizar chats
    setChats(prevChats => {
      console.log('🔄 [HANDLER] Chats antes de actualizar:', prevChats.length);
      const updated = prevChats.map(chat => {
        console.log(`🔍 [HANDLER] Verificando chat: ${chat.nombre_Chat_display}, tipo: ${chat.tipo_Chat}, id_otro_usuario: ${chat.id_otro_usuario}, buscando: ${data.userId}`);
        if (chat.tipo_Chat === 'privado' && chat.id_otro_usuario == data.userId) {
          console.log(`✏️ [HANDLER] ¡MATCH! Actualizando chat: ${chat.nombre_Chat_display} con emoji: ${data.iconEmoji}`);
          return {
            ...chat,
            otherUserIcon: data.iconEmoji
          };
        }
        return chat;
      });
      console.log('✅ [HANDLER] Chats actualizados:', updated.length);
      return updated;
    });

    // Actualizar usuarios
    setAllUsers(prevUsers => {
      console.log('🔄 [HANDLER] Usuarios antes de actualizar:', prevUsers.length);
      const updated = prevUsers.map(u => {
        console.log(`🔍 [HANDLER] Verificando usuario: ${u.nombre_Usuario}, id: ${u.id_Usuario}, buscando: ${data.userId}`);
        if (u.id_Usuario == data.userId) {
          console.log(`✏️ [HANDLER] ¡MATCH! Actualizando usuario: ${u.nombre_Usuario} con emoji: ${data.iconEmoji}`);
          return { ...u, IconoPerfil: data.iconEmoji };
        }
        return u;
      });
      console.log('✅ [HANDLER] Usuarios actualizados:', updated.length);
      return updated;
    });
  };

  const handleIconUnequipped = (data) => {
    testEventReceived('icon_unequipped');
    console.log('🔄 [HANDLER] handleIconUnequipped ejecutado:', data);
    
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.tipo_Chat === 'privado' && chat.id_otro_usuario == data.userId) {
          console.log(`✏️ [HANDLER] Desequipando icono en chat: ${chat.nombre_Chat_display}`);
          return {
            ...chat,
            otherUserIcon: 'default_avatar.png'
          };
        }
        return chat;
      })
    );

    setAllUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id_Usuario == data.userId) {
          console.log(`✏️ [HANDLER] Desequipando icono de usuario: ${u.nombre_Usuario}`);
          return { ...u, IconoPerfil: 'default_avatar.png' };
        }
        return u;
      })
    );
  };

  const handleUserOnline = (data) => {
    testEventReceived('user:online');
    console.log('🟢 [HANDLER] handleUserOnline ejecutado:', data);
    
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.tipo_Chat === 'privado' && chat.id_otro_usuario == data.userId) {
          console.log(`✏️ [HANDLER] Usuario ${data.userName} online en chat: ${chat.nombre_Chat_display}`);
          return {
            ...chat,
            otherUserOnline: true
          };
        }
        return chat;
      })
    );

    setAllUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id_Usuario == data.userId) {
          console.log(`✏️ [HANDLER] Usuario ${data.userName} online`);
          return { ...u, Estado: 1 };
        }
        return u;
      })
    );
  };

  const handleUserOffline = (data) => {
    testEventReceived('user:offline');
    console.log('🔴 [HANDLER] handleUserOffline ejecutado:', data);
    
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.tipo_Chat === 'privado' && chat.id_otro_usuario == data.userId) {
          console.log(`✏️ [HANDLER] Usuario ${data.userName} offline en chat: ${chat.nombre_Chat_display}`);
          return {
            ...chat,
            otherUserOnline: false
          };
        }
        return chat;
      })
    );

    setAllUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id_Usuario == data.userId) {
          console.log(`✏️ [HANDLER] Usuario ${data.userName} offline`);
          return { ...u, Estado: 0 };
        }
        return u;
      })
    );
  };

  // ============================================
  // REGISTRAR LISTENERS CON TIMEOUT
  // ============================================
  
  // Pequeño delay para asegurar que el socket esté 100% listo
  const timeoutId = setTimeout(() => {
    console.log('📝 [Dashboard] Iniciando registro de listeners...');
    
    onGlobalEvent('icon_equipped', handleIconEquipped);
    console.log('✅ Listener registrado: icon_equipped');
    
    onGlobalEvent('icon_unequipped', handleIconUnequipped);
    console.log('✅ Listener registrado: icon_unequipped');
    
    onGlobalEvent('user:online', handleUserOnline);
    console.log('✅ Listener registrado: user:online');
    
    onGlobalEvent('user:offline', handleUserOffline);
    console.log('✅ Listener registrado: user:offline');
    
    console.log('🎉 [Dashboard] Todos los listeners registrados correctamente');
  }, 100); // 100ms de delay

  // ============================================
  // CLEANUP
  // ============================================
  return () => {
    clearTimeout(timeoutId);
    console.log('🧹 [Dashboard] Limpiando listeners de iconos y estados');
    offGlobalEvent('icon_equipped');
    offGlobalEvent('icon_unequipped');
    offGlobalEvent('user:online');
    offGlobalEvent('user:offline');
  };
}, [isConnected, onGlobalEvent, offGlobalEvent]); 


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


const [tasks, setTasks] = useState([]);
const [loadingTasks, setLoadingTasks] = useState(false);
const [showNewTaskModal, setShowNewTaskModal] = useState(false);
const [newTaskData, setNewTaskData] = useState({
  titulo: '',
  descripcion: '',
  puntos_Recompensa: 10
});


  // ESTADOS PARA QUINIELAS
  const [quinielas, setQuinielas] = useState([]);
  const [loadingQuinielas, setLoadingQuinielas] = useState(false);
  const [quinielasDisponibles, setQuinielasDisponibles] = useState([]);
  const [showNewQuinielaModal, setShowNewQuinielaModal] = useState(false);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [quinielaSeleccionada, setQuinielaSeleccionada] = useState(null);
  const [participacionData, setParticipacionData] = useState({
    puntos: '',
    prediccion: ''
  });
  const [finalizarData, setFinalizarData] = useState({
    resultado: ''
  });

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
          setUser(usuario);
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

  // FUNCIÓN: Recargar solo los puntos del usuario actual
const recargarPuntosUsuario = async () => {
  try {
    console.log('🔄 Recargando puntos del usuario...');
    
    const token = localStorage.getItem("token");
    const usuarioStr = localStorage.getItem("usuario");
    
    if (!token || !usuarioStr) {
      console.warn('⚠️ No hay token o usuario');
      return;
    }
    
    const usuario = JSON.parse(usuarioStr);
    
    // ✅ CORRECCIÓN: Usar el endpoint correcto
    const API_BASE_URL = 'https://uneroded-forest-untasked.ngrok-free.dev/POI/vivemundialproject/vivemundialproject/backend/api';
    
    const response = await fetch(`${API_BASE_URL}/perfil`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    // Verificar que la respuesta sea JSON
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Respuesta no es JSON:', text.substring(0, 200));
      throw new Error('Respuesta del servidor no es JSON');
    }
    
    const data = await response.json();
    console.log('📡 Respuesta de perfil:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener perfil');
    }
    
    if (data.success) {
      const puntosActualizados = parseInt(data.data.Puntos) || 0;
      console.log('✅ Puntos actualizados:', puntosActualizados);
      
      // Actualizar estados
      setUserPoints(puntosActualizados);
      setUser(prev => ({ ...prev, Puntos: puntosActualizados }));
      
      // Actualizar localStorage
      const usuarioActualizado = { ...usuario, Puntos: puntosActualizados };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
    }
  } catch (error) {
    console.error('❌ Error al recargar puntos:', error);
    // Silenciar el error para no molestar al usuario
  }
};

  // Cargar chats
  useEffect(() => {
    loadChats();
  }, []);

  // NUEVO: Cargar todos los usuarios para el modal de nuevo chat
  useEffect(() => {
    loadAllUsers();
  }, []);
  useEffect(() => {
  loadShopIcons();
  loadUserIcons();
}, []);
  useEffect(() => {
    if (selectedChat?.id_Chat && selectedChat?.tipo_Chat === 'grupal') {
      console.log('📋 Chat grupal seleccionado, cargando tareas...');
      loadTasks(selectedChat.id_Chat);
    } else {
      setTasks([]);
    }
  }, [selectedChat?.id_Chat, selectedChat?.tipo_Chat]);
//Carga las quinielas del chat seleccionado
  useEffect(() => {
  if (selectedChat?.id_Chat) {
    console.log('📊 Chat seleccionado cambió, cargando quinielas...');
    loadQuinielas(selectedChat.id_Chat);
  } else {
    // Si no hay chat seleccionado, limpiar quinielas
    setQuinielas([]);
  }
}, [selectedChat?.id_Chat]);

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

// FUNCIONES DE TIENDA
// Cargar iconos disponibles de la tienda
const loadShopIcons = async () => {
  try {
    setLoadingShop(true);
    console.log('🛒 Cargando iconos de la tienda...');
    
    const response = await tiendaService.obtenerIconosDisponibles();
    
    if (response.success) {
      console.log('✅ Iconos de tienda cargados:', response.data);
      setShopIcons(response.data);
    } else {
      console.error('❌ Error al cargar iconos:', response.message);
      showAlertMessage('Error al cargar la tienda');
    }
  } catch (error) {
    console.error('❌ Error en loadShopIcons:', error);
    showAlertMessage('Error al cargar la tienda');
  } finally {
    setLoadingShop(false);
  }
};

 // Cargar iconos comprados por el usuario 
const loadUserIcons = async () => {
  try {
    console.log('👤 Cargando iconos del usuario...');
    
    const response = await tiendaService.obtenerMisIconos();
    
    if (response.success) {
      console.log('✅ Iconos del usuario cargados:', response.data);
      setUserIcons(response.data.iconos || []);
      setEquippedIcon(response.data.icono_equipado);
      
      // Si hay un icono equipado, actualizar el usuario en el estado
      if (response.data.icono_equipado) {
        setUser(prev => ({
          ...prev,
          IconoPerfil: response.data.icono_equipado.emoji
        }));
      }
    } else {
      console.error('❌ Error al cargar iconos del usuario:', response.message);
    }
  } catch (error) {
    console.error('❌ Error en loadUserIcons:', error);
  }
};

 // Verificar si el usuario ya tiene un icono
const userHasIcon = (id_Icono) => {
  return userIcons.some(icon => icon.id_Icono === id_Icono);
};

// Verificar si un icono está equipado
const isIconEquipped = (id_Icono) => {
  return equippedIcon && equippedIcon.id_Icono === id_Icono;
};

// Manejar la compra de un icono
const handleBuyIcon = async (icon) => {
  try {
    console.log('🛍️ Comprando icono:', icon);
    
    // Validar puntos suficientes
    if (userPoints < icon.precio_Puntos) {
      showAlertMessage(
        `No tienes suficientes puntos. Necesitas ${icon.precio_Puntos} puntos.`
      );
      return;
    }
    
    // Realizar la compra
    const response = await tiendaService.comprarIcono(icon.id_Icono);
    
    if (response.success) {
      showAlertMessage(`¡Compraste ${icon.nombre}! 🎉`);
      
      // Actualizar puntos del usuario
      setUserPoints(response.data.puntos_restantes);
      setUser(prev => ({
        ...prev,
        Puntos: response.data.puntos_restantes
      }));
      
      // Actualizar usuario en localStorage
      const usuarioActualizado = {
        ...user,
        Puntos: response.data.puntos_restantes
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      
      // Recargar iconos del usuario
      await loadUserIcons();
      
    } else {
      showAlertMessage(response.message || 'Error al comprar el icono');
    }
    
  } catch (error) {
    console.error('❌ Error al comprar icono:', error);
    showAlertMessage('Error al procesar la compra');
  }
};

//Manejar equipar un icono
const handleEquipIcon = async (icon) => {
  try {
    //console.log('⚡ Equipando icono:', icon);
    
    const response = await tiendaService.equiparIcono(icon.id_Icono);
    
    if (response.success) {
      showAlertMessage(`¡${icon.nombre} equipado! ✨`);
      
      // Actualizar icono equipado
      setEquippedIcon({
        id_Icono: icon.id_Icono,
        emoji: response.data.emoji_equipado,
        nombre: icon.nombre
      });
      
      // Actualizar usuario con el nuevo icono
      setUser(prev => ({
        ...prev,
        IconoPerfil: response.data.emoji_equipado
      }));
      
      // Actualizar localStorage
      const usuarioActualizado = {
        ...user,
        IconoPerfil: response.data.emoji_equipado
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      
      // Recargar iconos para actualizar el estado equipado
      await loadUserIcons();
      
      // Emitir evento WebSocket
      if (isConnected) {
        sendSocketMessage({
          type: 'icon_equipped',
          userId: currentUserId,
          userName: userName,
          iconEmoji: response.data.emoji_equipado,
          iconName: icon.nombre
        });
      }
      
    } else {
      showAlertMessage(response.message || 'Error al equipar el icono');
    }
    
  } catch (error) {
    console.error('❌ Error al equipar icono:', error);
    showAlertMessage('Error al equipar el icono');
  }
};

 //Manejar desequipar el icono actual
const handleUnequipIcon = async () => {
  try {
    //console.log('🔄 Desequipando icono...');
    
    const response = await tiendaService.desequiparIcono();
    
    if (response.success) {
      showAlertMessage('Icono desequipado');
      
      // Resetear icono equipado
      setEquippedIcon(null);
      setUser(prev => ({
        ...prev,
        IconoPerfil: 'default_avatar.png'
      }));
      
      // Actualizar localStorage
      const usuarioActualizado = {
        ...user,
        IconoPerfil: 'default_avatar.png'
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      
      // Recargar iconos
      await loadUserIcons();

      // Emitir evento WebSocket
      if (isConnected) {
        sendSocketMessage({
          type: 'icon_unequipped',
          userId: currentUserId,
          userName: userName
        });
      }

    } else {
      showAlertMessage(response.message || 'Error al desequipar');
    }
    
  } catch (error) {
    console.error('❌ Error al desequipar icono:', error);
    showAlertMessage('Error al desequipar icono');
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

  const loadTasks = async (id_Chat) => {
  if (!id_Chat) return;
  
  try {
    setLoadingTasks(true);
    console.log('📋 Cargando tareas del chat:', id_Chat);
    
    const response = await tareaService.listarTareas(id_Chat);
    
    if (response.success) {
      // Transformar el formato del backend al formato del frontend
      const tareasFormateadas = response.data.tareas.map(tarea => ({
        id: tarea.id_Tarea,
        name: tarea.titulo,
        description: tarea.descripcion,
        points: tarea.puntos_Recompensa,
        completed: tarea.estado === 'completada',
        completedBy: tarea.completada_por_nombre ? [tarea.completada_por_nombre] : [],
        createdBy: tarea.creador_nombre,
        creado_Por: tarea.creado_Por // Para validaciones
      }));
      
      setTasks(tareasFormateadas);
      console.log('✅ Tareas cargadas:', tareasFormateadas);
    }
  } catch (error) {
    console.error('❌ Error al cargar tareas:', error);
    showAlertMessage('Error al cargar las tareas');
  } finally {
    setLoadingTasks(false);
  }
};

  const handleCrearTarea = async () => {
    if (!newTaskData.titulo.trim()) {
      alert('El título de la tarea es obligatorio');
      return;
    }
    
    if (!selectedChat?.id_Chat) {
      alert('Error: No hay chat seleccionado');
      return;
    }
    
    try {
      console.log('📝 Creando tarea con datos:', newTaskData);
      
      const response = await tareaService.crearTarea(
        selectedChat.id_Chat,
        newTaskData.titulo,
        newTaskData.descripcion,
        newTaskData.puntos_Recompensa
      );
      
      if (response.success) {
        alert('✅ Tarea creada exitosamente');
        setShowNewTaskModal(false);
        setNewTaskData({ titulo: '', descripcion: '', puntos_Recompensa: 10 });
        loadTasks(selectedChat.id_Chat);
        
        if (isConnected) {
          sendSocketMessage({
            type: 'task_created',
            chatId: selectedChat.id_Chat,
            task: response.data,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('❌ Error al crear tarea:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleCompletarTarea = async (id_Tarea) => {
    try {
      console.log('✅ Completando tarea:', id_Tarea);
      
      const response = await tareaService.completarTarea(id_Tarea);
      
      if (response.success) {
        alert(`🎉 ${response.message}`);
        loadTasks(selectedChat.id_Chat);
        
        if (isConnected) {
          sendSocketMessage({
            type: 'task_completed',
            chatId: selectedChat.id_Chat,
            taskId: id_Tarea,
            completedBy: userName,
            puntosGanados: response.data.puntos_ganados,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('❌ Error al completar tarea:', error);
      alert('Error: ' + error.message);
    }
  };

  // FUNCIÓN: CARGAR QUINIELAS DEL CHAT
  const loadQuinielas = async (id_Chat) => {
    if (!id_Chat) return;

    try {
      setLoadingQuinielas(true);
      console.log('📊 Cargando quinielas del chat:', id_Chat);

      const response = await quinielaService.listarPorChat(id_Chat);
      
      if (response.success) {
        const quinielasFormateadas = response.data.quinielas.map(q => ({
          id: q.id_Quiniela_Chat,
          id_Quiniela: q.id_Quiniela,
          name: q.nombre,
          description: q.descripcion,
          participants: parseInt(q.total_participantes) || 0,
          totalPoints: parseInt(q.total_puntos_apostados) || 0,
          status: q.estado, // 'activa' o 'finalizada'
          resultado: q.resultado,
          agregadoPor: q.agregado_Por,
          agregador: q.agregador,
          tipo: q.tipo
        }));

        setQuinielas(quinielasFormateadas);
        console.log('✅ Quinielas cargadas:', quinielasFormateadas);
      }
    } catch (error) {
      console.error('❌ Error al cargar quinielas:', error);
      alert('Error al cargar quinielas: ' + error.message);
    } finally {
      setLoadingQuinielas(false);
    }
  };
// Exponer funciones globalmente
useEffect(() => {
  window.loadQuinielasFromSocket = loadQuinielas;
  window.recargarPuntosUsuario = recargarPuntosUsuario;
  
  return () => {
    delete window.loadQuinielasFromSocket;
    delete window.recargarPuntosUsuario;
  };
}, [loadQuinielas, recargarPuntosUsuario]);
 // FUNCIÓN: CARGAR QUINIELAS DISPONIBLES
  const loadQuinielasDisponibles = async () => {
    try {
      console.log('📋 Cargando quinielas disponibles...');

      const response = await quinielaService.listarDisponibles();
      
      if (response.success) {
        setQuinielasDisponibles(response.data.quinielas);
        console.log('✅ Quinielas disponibles:', response.data.quinielas);
      }
    } catch (error) {
      console.error('❌ Error al cargar quinielas disponibles:', error);
      alert('Error al cargar quinielas disponibles: ' + error.message);
    }
  };
   // FUNCIÓN: AGREGAR QUINIELA AL CHAT
const handleAgregarQuiniela = async (id_Quiniela) => {
  if (!selectedChat) return;

  try {
    console.log('➕ Agregando quiniela al chat:', { 
      id_Quiniela, 
      id_Chat: selectedChat.id_Chat
    });

    const response = await quinielaService.agregarAChat(
      id_Quiniela, 
      selectedChat.id_Chat
    );
    
    if (response.success) {
      alert('✅ Quiniela agregada exitosamente al chat');
      
      // Recargar quinielas del chat
      await loadQuinielas(selectedChat.id_Chat);
      
      // Cerrar modal
      setShowNewQuinielaModal(false);

      // ✅ CORREGIDO: Emitir evento WebSocket
      if (isConnected) {
        sendSocketMessage({
          type: 'quiniela_added',
          chatId: selectedChat.id_Chat,
          quiniela: response.data.quiniela
        });
      }
    }
  } catch (error) {
    console.error('❌ Error al agregar quiniela:', error);
    alert('Error al agregar quiniela: ' + error.message);
  }
};
    // FUNCIÓN: PARTICIPAR EN QUINIELA
const handleParticiparQuiniela = async () => {
  if (!quinielaSeleccionada) return;

  // Validaciones
  if (!participacionData.puntos || participacionData.puntos <= 0) {
    alert('⚠️ Debes ingresar una cantidad de puntos válida');
    return;
  }

  if (!participacionData.prediccion || participacionData.prediccion.trim() === '') {
    alert('⚠️ Debes ingresar tu predicción');
    return;
  }

  try {
    console.log('🎲 Participando en quiniela:', {
      id_Quiniela_Chat: quinielaSeleccionada.id,
      puntos: participacionData.puntos,
      prediccion: participacionData.prediccion
    });

    const response = await quinielaService.participar(
      quinielaSeleccionada.id,
      parseInt(participacionData.puntos),
      participacionData.prediccion
    );
    
    if (response.success) {
      alert(`✅ Participación registrada!\nApostaste ${participacionData.puntos} puntos`);
      
// Actualizar puntos del usuario
const nuevosPuntos = user.Puntos - parseInt(participacionData.puntos);

await recargarPuntosUsuario();

      // Recargar quinielas del chat
      await loadQuinielas(selectedChat.id_Chat);
      
      // Cerrar modal y limpiar datos
      setShowParticipateModal(false);
      setQuinielaSeleccionada(null);
      setParticipacionData({ puntos: '', prediccion: '' });

      // ✅ CORREGIDO: Emitir evento WebSocket
      if (isConnected) {
        sendSocketMessage({
          type: 'quiniela_participated',
          chatId: selectedChat.id_Chat,
          id_Quiniela_Chat: quinielaSeleccionada.id,
          usuario: user.nombre_Usuario
        });
      }
    }
  } catch (error) {
    console.error('❌ Error al participar en quiniela:', error);
    alert('Error al participar: ' + error.message);
  }
};


  // FUNCIÓN: FINALIZAR QUINIELA
const handleFinalizarQuiniela = async () => {
  if (!quinielaSeleccionada) return;

  if (!finalizarData.resultado || finalizarData.resultado.trim() === '') {
    alert('⚠️ Debes ingresar el resultado de la quiniela');
    return;
  }

  try {
    console.log('🏁 Finalizando quiniela:', {
      id_Quiniela_Chat: quinielaSeleccionada.id,
      resultado: finalizarData.resultado
    });

    const response = await quinielaService.finalizar(
      quinielaSeleccionada.id,
      finalizarData.resultado
    );
    
    if (response.success) {
      alert('✅ Quiniela finalizada exitosamente');
      
      await recargarPuntosUsuario();
      
      // Recargar quinielas del chat
      await loadQuinielas(selectedChat.id_Chat);
      
      // Cerrar modal y limpiar datos
      setShowFinalizarModal(false);
      setQuinielaSeleccionada(null);
      setFinalizarData({ resultado: '' });

      // Emitir evento WebSocket
      if (isConnected) {
        sendSocketMessage({
          type: 'quiniela_finished',
          chatId: selectedChat.id_Chat,
          id_Quiniela_Chat: quinielaSeleccionada.id,
          resultado: response.data.resultado
        });
      }
    }
  } catch (error) {
    console.error('❌ Error al finalizar quiniela:', error);
    alert('Error al finalizar quiniela: ' + error.message);
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
  // useEffect: CARGAR QUINIELAS AL SELECCIONAR CHAT
  useEffect(() => {
    if (selectedChat) {
      loadQuinielas(selectedChat.id);
    } else {
      setQuinielas([]);
    }
  }, [selectedChat]);

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
  {loadingShop ? (
    <div className="flex items-center justify-center py-8">
      <div className="text-gray-500">Cargando tienda...</div>
    </div>
  ) : shopIcons.length === 0 ? (
    <div className="flex items-center justify-center py-8">
      <div className="text-gray-500">No hay iconos disponibles</div>
    </div>
  ) : (
    shopIcons.map((icon) => {
      const hasIcon = userHasIcon(icon.id_Icono);
      const isEquipped = isIconEquipped(icon.id_Icono);
      
      return (
        <div
          key={icon.id_Icono}
          className="mb-3 p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                {icon.emoji}
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  {icon.nombre}
                </div>
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Coins className="w-3 h-3" />
                  <span className="text-sm font-medium">
                    {icon.precio_Puntos} puntos
                  </span>
                </div>
              </div>
            </div>
            
            {/* BOTONES DINÁMICOS */}
            <div className="flex flex-col gap-1">
              {!hasIcon ? (
                // NO TIENE EL ICONO - Mostrar botón Comprar
                <button
                  onClick={() => handleBuyIcon(icon)}
                  disabled={userPoints < icon.precio_Puntos}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userPoints >= icon.precio_Puntos
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {userPoints >= icon.precio_Puntos
                    ? "Comprar"
                    : "Sin puntos"}
                </button>
              ) : isEquipped ? (
                // TIENE EL ICONO Y ESTÁ EQUIPADO
                <div className="flex flex-col gap-1">
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white cursor-default"
                  >
                    ✓ Equipado
                  </button>
                  <button
                    onClick={handleUnequipIcon}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Desequipar
                  </button>
                </div>
              ) : (
                // TIENE EL ICONO PERO NO ESTÁ EQUIPADO
                <button
                  onClick={() => handleEquipIcon(icon)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                  Equipar
                </button>
              )}
            </div>
          </div>
        </div>
      );
    })
  )}
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
  <Avatar 
    iconoPerfil={user.IconoPerfil} 
    size="md"
  />
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
  <div className="relative flex-shrink-0">
    {chat.tipo_Chat === "privado" ? (
      // CHAT PRIVADO: Mostrar avatar del otro usuario con emoji
      <>
        <Avatar 
          iconoPerfil={chat.otherUserIcon} 
          size="lg"
        />
        {/* Indicador de online si está conectado */}
        {chat.otherUserOnline && (
          <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
            chat.otherUserOnline ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
        )}
      </>
    ) : (
      // CHAT GRUPAL: Mantener icono de grupo
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <span className="text-white text-lg">👥</span>
      </div>
    )}
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between mb-1">
      <h3 className="font-semibold text-gray-800 truncate">
        {chat.nombre_Chat_display ||
          chat.nombre_Chat ||
          "Chat Privado"}
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
            userPoints={userPoints}        
  setUserPoints={setUserPoints}  
  user={user}                    
  setUser={setUser}              
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
  onClick={() => {
    loadQuinielasDisponibles();
    setShowNewQuinielaModal(true);
  }}
  className="text-sm text-blue-600 hover:underline"
>
  + Nueva
</button>
                </div>

                {/* SECCIÓN DE QUINIELAS - INTEGRADA CON BACKEND */}
                {loadingQuinielas ? (
                  <div className="text-center text-gray-500 py-4 mb-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm">Cargando quinielas...</p>
                  </div>
                ) : quinielas.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 mb-6">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay quinielas aún</p>
                    <button
                      onClick={() => {
                        loadQuinielasDisponibles();
                        setShowNewQuinielaModal(true);
                      }}
                      className="mt-3 text-blue-600 hover:underline text-sm"
                    >
                      Agregar primera quiniela
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {quinielas.map((q) => (                  
                      <div
                        key={q.id}
                        className={`bg-white rounded-xl p-4 border-2 transition-shadow ${
                          q.status === 'finalizada' 
                            ? 'border-gray-300 bg-gray-50' 
                            : 'border-blue-200 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {q.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {q.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Agregado por: {q.agregador}
                            </p>
                            {q.status === 'finalizada' && q.resultado && (
                              <p className="text-xs text-green-600 font-semibold mt-1">
                                ✅ Resultado: {q.resultado}
                              </p>
                            )}
                          </div>
                          <Trophy className={`w-5 h-5 ${q.status === 'finalizada' ? 'text-gray-400' : 'text-yellow-500'}`} />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <span>{q.participants} participantes</span>
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <Coins className="w-4 h-4" />
                            <span className="font-medium">
                              {q.totalPoints} pts
                            </span>
                          </div>
                        </div>
                        
{/* Botones de acción */}
{q.status === 'activa' && (
  <div className="flex gap-2">
    <button
      onClick={() => {
        setQuinielaSeleccionada(q);
        setShowParticipateModal(true);
      }}
      className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Participar
    </button>
    {/* ✅ CORREGIDO: Comparación con conversión de tipos */}
    {currentUserId && q.agregadoPor && 
     parseInt(q.agregadoPor) === parseInt(currentUserId) && (
      <button
        onClick={() => {
          setQuinielaSeleccionada(q);
          setShowFinalizarModal(true);
        }}
        className="flex-1 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Finalizar
      </button>
    )}
  </div>
)}
                        {q.status === 'finalizada' && (
                          <div className="py-2 text-center text-sm bg-gray-200 text-gray-600 rounded-lg">
                            Quiniela Finalizada
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ============================================ */}
                {/* SECCIÓN DE TAREAS - MODIFICADA */}
                {/* ============================================ */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {selectedChat?.tipo_Chat === 'grupal' ? 'Tareas del Grupo' : 'Tareas'}
                    </h3>
                    {/* Botón de crear tarea - solo en chats grupales */}
                    {selectedChat?.tipo_Chat === 'grupal' && (
                      <button
                        onClick={() => setShowNewTaskModal(true)}
                        className="text-sm text-green-600 hover:underline"
                        title="Crear nueva tarea"
                      >
                        + Nueva
                      </button>
                    )}
                  </div>

                  {/* Estado de carga */}
                  {loadingTasks ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                      <p className="text-sm">Cargando tareas...</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    /* Estado vacío */
                    <div className="text-center text-gray-500 py-8">
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay tareas aún</p>
                      {selectedChat?.tipo_Chat === 'grupal' && (
                        <button
                          onClick={() => setShowNewTaskModal(true)}
                          className="mt-3 text-green-600 hover:underline text-sm"
                        >
                          Crear la primera tarea
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Lista de tareas */
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
                              {t.description && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {t.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Creado por: {t.createdBy || 'Desconocido'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600">
                              <Coins className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {t.points}
                              </span>
                            </div>
                          </div>

                          {/* Mostrar quién completó la tarea */}
                          {t.completedBy && t.completedBy.length > 0 && (
                            <div className="text-xs text-gray-600 mb-2">
                              ✅ Completado por: {t.completedBy.join(", ")}
                            </div>
                          )}

                          {/* Botón de completar tarea */}
                          <button
                            onClick={() => handleCompletarTarea(t.id)}
                            disabled={t.completed || t.creado_Por === currentUserId}
                            className={`w-full py-2 text-sm rounded-lg transition-colors ${
                              t.completed
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : t.creado_Por === currentUserId
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          >
                            {t.completed ? (
                              <div className="flex items-center justify-center space-x-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>✓ Completada</span>
                              </div>
                            ) : t.creado_Por === currentUserId ? (
                              "No puedes completar tu propia tarea"
                            ) : (
                              "Completar Tarea"
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* ============================================ */}
                {/* FIN DE SECCIÓN DE TAREAS MODIFICADA */}
                {/* ============================================ */}
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

      {showNewChatModal && (
        <NewChatModal
          show={showNewChatModal}
          newChatType={newChatType}
          setNewChatType={setNewChatType}
          groupName={groupName}
          setGroupName={setGroupName}
          allUsers={allUsers}
          selectedUsers={selectedUsers}
          toggleUserSelection={toggleUserSelection}
          closeModal={closeModal}
          handleCreateChat={handleCreateChat}
        />
      )}
      {showNewTaskModal && (
  <NewTaskModal
    show={showNewTaskModal}
    onClose={() => {
      setShowNewTaskModal(false);
      setNewTaskData({ titulo: '', descripcion: '', puntos_Recompensa: 10 });
    }}
    onSubmit={handleCrearTarea}
    taskData={newTaskData}
    setTaskData={setNewTaskData}
  />
)}
{/* ============================================ */}
      {/* MODALES DE QUINIELAS */}
      {/* ============================================ */}
      
      {/* Modal: Agregar Quiniela */}
      {showNewQuinielaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🏆 Agregar Quiniela al Chat
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Selecciona una quiniela disponible para agregarla a este chat:
            </p>

            {quinielasDisponibles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay quinielas disponibles en este momento</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {quinielasDisponibles.map((q) => (
                  <div
                    key={q.id_Quiniela}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => handleAgregarQuiniela(q.id_Quiniela)}
                  >
                    <h4 className="font-semibold text-gray-800">{q.nombre}</h4>
                    <p className="text-sm text-gray-600 mt-1">{q.descripcion}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Tipo: {q.tipo}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        q.activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {q.activa ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowNewQuinielaModal(false);
                setQuinielasDisponibles([]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Participar en Quiniela */}
      {showParticipateModal && quinielaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🎲 Participar en Quiniela
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800">{quinielaSeleccionada.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{quinielaSeleccionada.description}</p>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-gray-600">
                  {quinielaSeleccionada.participants} participantes
                </span>
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Coins className="w-4 h-4" />
                  <span className="font-medium">{quinielaSeleccionada.totalPoints} pts</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Puntos a apostar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puntos a apostar *
                </label>
                <input
                  type="number"
                  value={participacionData.puntos}
                  onChange={(e) => setParticipacionData({ ...participacionData, puntos: e.target.value })}
                  placeholder="Ej: 100"
                  min="1"
                  max={user.Puntos}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tienes {user.Puntos} puntos disponibles
                </p>
                <p className="text-xs text-green-600 mt-1">
                  💰 Ganarás: {participacionData.puntos ? Math.floor(participacionData.puntos * 1.5) : 0} puntos si aciertas
                </p>
              </div>

              {/* Predicción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu predicción *
                </label>
                <input
                  type="text"
                  value={participacionData.prediccion}
                  onChange={(e) => setParticipacionData({ ...participacionData, prediccion: e.target.value })}
                  placeholder="Ej: Argentina"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  maxLength="255"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa tu respuesta a la quiniela
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowParticipateModal(false);
                  setQuinielaSeleccionada(null);
                  setParticipacionData({ puntos: '', prediccion: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleParticiparQuiniela}
                disabled={!participacionData.puntos || !participacionData.prediccion}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Finalizar Quiniela */}
      {showFinalizarModal && quinielaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🏁 Finalizar Quiniela
            </h3>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800">{quinielaSeleccionada.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{quinielaSeleccionada.description}</p>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-gray-600">
                  {quinielaSeleccionada.participants} participantes
                </span>
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Coins className="w-4 h-4" />
                  <span className="font-medium">{quinielaSeleccionada.totalPoints} pts apostados</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Al finalizar, se repartirán los premios a los ganadores (x1.5 de lo apostado)
              </p>
            </div>

            <div className="space-y-4">
              {/* Resultado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resultado de la quiniela *
                </label>
                <input
                  type="text"
                  value={finalizarData.resultado}
                  onChange={(e) => setFinalizarData({ resultado: e.target.value })}
                  placeholder="Ej: Argentina"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black"
                  maxLength="255"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa el resultado real de la quiniela
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowFinalizarModal(false);
                  setQuinielaSeleccionada(null);
                  setFinalizarData({ resultado: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizarQuiniela}
                disabled={!finalizarData.resultado}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Finalizar Quiniela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NewTaskModal = ({ show, onClose, onSubmit, taskData, setTaskData }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📝 Nueva Tarea
        </h3>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={taskData.titulo}
              onChange={(e) => setTaskData({ ...taskData, titulo: e.target.value })}
              placeholder="Ej: Investigar sedes del Mundial"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black"
              maxLength="255"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={taskData.descripcion}
              onChange={(e) => setTaskData({ ...taskData, descripcion: e.target.value })}
              placeholder="Describe la tarea con más detalle..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none text-black"
              rows="3"
            />
          </div>

          {/* Puntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntos de Recompensa
            </label>
            <input
              type="number"
              value={taskData.puntos_Recompensa}
              onChange={(e) => setTaskData({ ...taskData, puntos_Recompensa: parseInt(e.target.value) || 10 })}
              min="1"
              max="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo: 1 punto - Máximo: 1000 puntos
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!taskData.titulo.trim()}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Crear Tarea
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
