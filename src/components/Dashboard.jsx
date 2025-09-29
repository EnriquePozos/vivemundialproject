import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, ChevronDown } from 'lucide-react';
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
  Mic
} from 'lucide-react';

// Componente de Chat Privado integrado
const PrivateChat = ({ chatData, onBack }) => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('quinielas');
  const [showNewQuinielaModal, setShowNewQuinielaModal] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);

  const currentChat = chatData || {
    id: 2,
    name: "Cynthia Sustaita",
    type: "private",
    online: true,
    lastSeen: "En línea",
    avatar: "👩"
  };

  const messages = [
    { 
      id: 1, 
      sender: "Cynthia Sustaita", 
      message: "¡Hola! ¿Cómo estás?", 
      time: "14:30", 
      isOwn: false,
      encrypted: false
    },
    { 
      id: 2, 
      sender: "Tú", 
      message: "¡Muy bien! ¿Viste el partido de ayer?", 
      time: "14:32", 
      isOwn: true,
      encrypted: false
    },
    { 
      id: 3, 
      sender: "Cynthia Sustaita", 
      message: "¡Sí! Estuvo increíble. México jugó muy bien", 
      time: "14:35", 
      isOwn: false,
      encrypted: false
    },
    { 
      id: 4, 
      sender: "Cynthia Sustaita", 
      message: "¿Quieres hacer una quiniela para el próximo partido?", 
      time: "14:37", 
      isOwn: false,
      encrypted: false
    },
    { 
      id: 5, 
      sender: "Tú", 
      message: "🔒 Este mensaje está cifrado", 
      time: "14:40", 
      isOwn: true,
      encrypted: true
    },
  ];

  const quinielas = [
    {
      id: 1,
      name: "Argentina vs Francia",
      description: "¿Quién ganará la final?",
      participants: 2,
      totalPoints: 1000,
      userBet: 500,
      status: "active",
      endTime: "2024-03-20 16:00",
      createdBy: "Ana García"
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
      createdBy: "Tú"
    }
  ];

  const tasks = [
    {
      id: 1,
      name: "Compartir predicción",
      description: "Comparte tu predicción para el próximo partido",
      points: 150,
      completed: false,
      completedBy: []
    },
    {
      id: 2,
      name: "Enviar ubicación del estadio",
      description: "Comparte la ubicación de donde verás el partido",
      points: 100,
      completed: true,
      completedBy: ["Ana García"]
    },
    {
      id: 3,
      name: "Intercambiar datos curiosos",
      description: "Comparte un dato curioso sobre el mundial",
      points: 200,
      completed: false,
      completedBy: []
    }
  ];

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "Tú",
        message: encryptionEnabled ? "🔒 Este mensaje está cifrado" : message,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        encrypted: encryptionEnabled
      };
      
      console.log('Sending message:', newMessage);
      setMessage('');
    }
  };

  const sendFile = (type) => {
    console.log(`Enviando archivo de tipo: ${type}`);
    alert(`Función de envío de ${type} - Próximamente disponible`);
  };

  const shareLocation = () => {
    console.log('Compartiendo ubicación');
    alert('Compartiendo ubicación actual...');
  };

  const startVideoCall = () => {
    console.log('Iniciando videollamada');
    alert('Iniciando videollamada con ' + currentChat.name + '...');
  };

  const startVoiceCall = () => {
    console.log('Iniciando llamada de voz');
    alert('Iniciando llamada de voz con ' + currentChat.name + '...');
  };

  const NewQuinielaModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowNewQuinielaModal(false)}></div>
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Nueva Quiniela Privada</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Quiniela
              </label>
              <input
                type="text"
                placeholder="Ej: Brasil vs Argentina"
                className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                placeholder="Describe la quiniela..."
                rows={3}
                className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntos a apostar
              </label>
              <input
                type="number"
                placeholder="500"
                min="50"
                max="2000"
                className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha límite
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowNewQuinielaModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowNewQuinielaModal(false);
                  alert('Quiniela creada exitosamente!');
                }}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Crear
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowNewQuinielaModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );

  return (
  <div className="h-full flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
                  {currentChat.avatar}
                </div>
                {currentChat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{currentChat.name}</h2>
                <p className="text-sm text-green-600">{currentChat.lastSeen}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={startVoiceCall}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              title="Llamada de voz"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button 
              onClick={startVideoCall}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              title="Videollamada"
            >
              <Video className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setEncryptionEnabled(!encryptionEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                encryptionEnabled 
                  ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title={encryptionEnabled ? 'Cifrado activado' : 'Activar cifrado'}
            >
              {encryptionEnabled ? <Shield className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Mensajes y barra de texto siempre visibles */}
          <div className="flex flex-col h-full">
            <div className="flex-1 p-6 overflow-y-auto" style={{minHeight:0}}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}> 
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
                      msg.isOwn 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      {msg.encrypted && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Shield className="w-3 h-3" />
                          <span className="text-xs opacity-75">Cifrado</span>
                        </div>
                      )}
                      <div className="text-sm">{msg.message}</div>
                      <div className={`text-xs mt-2 ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Barra de texto fija abajo */}
            <div className="p-6 bg-white border-t border-gray-200">
              {encryptionEnabled && (
                <div className="mb-3 flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <Shield className="w-4 h-4" />
                  <span>Los mensajes están cifrados de extremo a extremo</span>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => sendFile('imagen')}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                    title="Enviar imagen"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => sendFile('archivo')}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                    title="Enviar archivo"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => sendFile('audio')}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                    title="Enviar audio"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={shareLocation}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                    title="Compartir ubicación"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={encryptionEnabled ? "Escribe un mensaje cifrado..." : "Escribe un mensaje..."}
                    className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Quinielas y Tareas */}
        <div className="w-80 bg-white border-l border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('quinielas')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'quinielas'
                  ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Trophy className="w-4 h-4 inline-block mr-2" />
              Quinielas
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'tasks'
                  ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Target className="w-4 h-4 inline-block mr-2" />
              Tareas
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {activeTab === 'quinielas' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Quinielas Privadas</h3>
                  <button
                    onClick={() => setShowNewQuinielaModal(true)}
                    className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {quinielas.map((quiniela) => (
                  <div key={quiniela.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{quiniela.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{quiniela.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Por: {quiniela.createdBy}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs font-medium">1v1</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total en juego:</span>
                        <span className="font-medium text-yellow-600">
                          <Coins className="w-3 h-3 inline mr-1" />
                          {quiniela.totalPoints}
                        </span>
                      </div>
                      {quiniela.userBet && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tu apuesta:</span>
                          <span className="font-medium text-blue-600">
                            <Coins className="w-3 h-3 inline mr-1" />
                            {quiniela.userBet}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Termina:</span>
                        <span className="font-medium text-red-600 text-xs">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {quiniela.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      {quiniela.userBet ? (
                        <button className="w-full py-2 text-sm bg-green-100 text-green-700 rounded-lg">
                          Ya participas en esta quiniela
                        </button>
                      ) : (
                        <button className="w-full py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                          Participar (1v1)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Tareas Privadas</h3>

                {tasks.map((task) => (
                  <div key={task.id} className={`rounded-lg p-4 border ${
                    task.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{task.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm font-medium">{task.points}</span>
                      </div>
                    </div>

                    {task.completedBy.length > 0 && (
                      <div className="text-xs text-gray-600 mb-2">
                        Completado por: {task.completedBy.join(', ')}
                      </div>
                    )}

                    <button
                      disabled={task.completed}
                      className={`w-full py-2 text-sm rounded-lg transition-colors ${
                        task.completed
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {task.completed ? (
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completada</span>
                        </div>
                      ) : (
                        'Marcar como completada'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewQuinielaModal && <NewQuinielaModal />}
    </div>
  );
};

const Dashboard = ({ userData, onLogout }) => {
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatType, setNewChatType] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedChat, setSelectedChat] = useState(null);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const shopRef = useRef(null);
  
  const userPoints = 1850;
  const userName = userData?.username || "Usuario";

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (shopRef.current && !shopRef.current.contains(event.target)) {
      setShowShopDropdown(false);
    }
  };

  if (showShopDropdown) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showShopDropdown]);
  
  const chats = [
    {
      id: 1,
      name: "México vs Brasil",
      type: "group",
      participants: 5,
      lastMessage: "¡Nueva quiniela disponible!",
      time: "14:32",
      unread: 3,
      online: 3
    },
    {
      id: 2,
      name: "Cynthia Sustaita",
      type: "private",
      lastMessage: "¿Viste el partido de ayer?",
      time: "13:45",
      unread: 0,
      online: true
    },
    {
      id: 3,
      name: "Quiniela Champions",
      type: "group",
      participants: 12,
      lastMessage: "Diego: Yo voy por Argentina",
      time: "12:20",
      unread: 7,
      online: 8
    },
    {
      id: 4,
      name: "Enrique Pozos",
      type: "private",
      lastMessage: "Gracias por los puntos 🏆",
      time: "11:15",
      unread: 0,
      online: false
    }
  ];

  const availableUsers = [
    { id: 1, name: "Cynthia Sustaita", online: true, avatar: "👩" },
    { id: 2, name: "Enrique Pozos", online: false, avatar: "👨" },
    { id: 3, name: "María López", online: true, avatar: "👩" },
    { id: 4, name: "Diego Pérez", online: true, avatar: "👨" },
    { id: 5, name: "Carmen Silva", online: false, avatar: "👩" }
  ];

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const shopIcons = [
  { 
    id: 1, 
    name: "Balón de Fútbol", 
    emoji: "⚽", 
    price: 200, 
    category: "deportes",
    rarity: "común"
  },
  { 
    id: 2, 
    name: "Trofeo de Oro", 
    emoji: "🏆", 
    price: 500, 
    category: "premios",
    rarity: "raro"
  },
  { 
    id: 3, 
    name: "Bandera Mundial", 
    emoji: "🏳️‍🌈", 
    price: 150, 
    category: "banderas",
    rarity: "común"
  },
  { 
    id: 4, 
    name: "Medalla de Oro", 
    emoji: "🥇", 
    price: 350, 
    category: "premios",
    rarity: "poco común"
  },
  { 
    id: 5, 
    name: "Corona Real", 
    emoji: "👑", 
    price: 800, 
    category: "especiales",
    rarity: "legendario"
  },
  { 
    id: 6, 
    name: "Estrella Dorada", 
    emoji: "⭐", 
    price: 300, 
    category: "especiales",
    rarity: "poco común"
  }
];

  const handleCreateChat = () => {
    if (newChatType === 'group' && selectedUsers.length < 2) {
      showAlertMessage('Selecciona al menos 2 usuarios para crear un grupo');
      return;
    }
    if (newChatType === 'private' && selectedUsers.length !== 1) {
      showAlertMessage('Selecciona exactamente 1 usuario para chat privado');
      return;
    }
    
    const selectedUserNames = selectedUsers.map(id => 
      availableUsers.find(user => user.id === id)?.name
    ).join(', ');
    
    console.log('Creando chat:', { type: newChatType, users: selectedUsers, groupName });
    setShowNewChatModal(false);
    setSelectedUsers([]);
    setGroupName('');
    setNewChatType('');
    
    showAlertMessage(
      `¡Chat ${newChatType === 'group' ? 'grupal' : 'privado'} creado con ${selectedUserNames}!`
    );
  };

  const toggleUserSelection = (userId) => {
    if (newChatType === 'private') {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const closeModal = () => {
    setShowNewChatModal(false);
    setNewChatType('');
    setSelectedUsers([]);
    setGroupName('');
  };

  const handleChatClick = (chat) => {
    console.log('Abriendo chat:', chat);
    setSelectedChat(chat);
    setCurrentView('chat');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedChat(null);
  };

  const handleBuyIcon = (icon) => {
  if (userPoints < icon.price) {
    showAlertMessage(`No tienes suficientes puntos. Necesitas ${icon.price} puntos.`);
    return;
  }
  
  // Aquí simularemos la compra (en una app real actualizarías la base de datos)
  showAlertMessage(`¡Compraste ${icon.name} por ${icon.price} puntos!`);
  setShowShopDropdown(false);
  
  // En una implementación real, actualizarías los puntos del usuario
  console.log('Icono comprado:', icon);
};

  const Alert = () => (
    <div className={`fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 transform transition-all duration-300 ${
      showAlert ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium">{alertMessage}</span>
    </div>
  );

  const NewChatModal = () => (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-md">
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={closeModal}
        style={{background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)'}}
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
            <div className="space-y-4">
              <button
                onClick={() => setNewChatType('private')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-4"
              >
                <MessageCircle className="w-8 h-8 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Chat Privado</div>
                  <div className="text-sm text-gray-600">Conversación 1 a 1</div>
                </div>
              </button>
              
              <button
                onClick={() => setNewChatType('group')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex items-center space-x-4"
              >
                <Users className="w-8 h-8 text-green-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Chat Grupal</div>
                  <div className="text-sm text-gray-600">Mínimo 3 integrantes</div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {newChatType === 'group' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Grupo
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ej: Quiniela Mundial 2026"
                    className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seleccionar {newChatType === 'private' ? 'Usuario' : 'Usuarios'}
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleUserSelection(user.id)}
                      className={`p-3 border-b border-gray-100 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                        selectedUsers.includes(user.id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{user.name}</div>
                          <div className={`text-xs ${user.online ? 'text-green-500' : 'text-gray-400'}`}>
                            {user.online ? 'En línea' : 'Desconectado'}
                          </div>
                        </div>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setNewChatType('');
                    setSelectedUsers([]);
                    setGroupName('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Atrás
                </button>
                <button
                  onClick={handleCreateChat}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
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

  // Renderizar vista condicional


  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Alert */}
      <Alert />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">⚽</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Vive Mundial</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Puntos del usuario */}
            <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-yellow-800">{userPoints}</span>
            </div>
            
            {/* Tienda */}
            <div className="relative" ref={shopRef}>
              <button
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowShopDropdown((prev) => !prev)}
              >
                <ShoppingBag className="w-6 h-6" />
                <span className="hidden md:block text-sm font-medium">Tienda</span>
              </button>
              
              {showShopDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50">
                  {/* Header de la tienda */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <ShoppingBag className="w-5 h-5 mr-2 text-yellow-600" />
                        Tienda de Iconos
                      </h3>
                      <button
                        onClick={() => setShowShopDropdown(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  {/* Lista de iconos */}
                  <div className="max-h-96 overflow-y-auto">
                    {shopIcons.map((icon) => (
                      <div key={icon.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{icon.emoji}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{icon.name}</h4>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-yellow-600 font-bold">
                              <Coins className="w-4 h-4" />
                              <span>{icon.price}</span>
                            </div>
                            <button
                              className={`mt-2 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                userPoints >= icon.price
                                  ? 'bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-105'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                              onClick={() => handleBuyIcon(icon)}
                              disabled={userPoints < icon.price}
                            >
                              {userPoints >= icon.price ? 'Comprar' : 'Sin puntos'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer de la tienda */}
                  <div className="p-4 bg-gray-50 text-center">
                    <p className="text-xs text-gray-600">
                      ¡Gana más puntos participando en quinielas y completando tareas!
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Configuración */}
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
              <Settings className="w-6 h-6" />
            </button>
            
            {/* Avatar del usuario */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-800">{userName}</span>
            </div>
            
            {/* Logout */}
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

      <div className="flex h-screen">
        {/* Sidebar izquierdo - Lista de Chats */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header de chats */}
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
            
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lista de chats */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                      chat.type === 'group' 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {chat.type === 'group' ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {chat.type === 'private' && chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                        {chat.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{chat.time}</span>
                        {chat.unread > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.type === 'group' && (
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{chat.participants} miembros</span>
                        </div>
                        <span className="text-xs text-green-500">{chat.online} en línea</span>
                      </div>
                    )}
                    
                    {/* Indicador de que es clickeable */}
                    <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                      Clic para abrir chat →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            {selectedChat ? (
              <div className="w-full h-full">
                <PrivateChat chatData={selectedChat} onBack={() => setSelectedChat(null)} />
              </div>
            ) : (
              <div className="text-center max-w-md">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  ¡Bienvenido al Mundial!
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Selecciona un chat de la lista izquierda para comenzar a conversar y participar en quinielas del Mundial FIFA 2026.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group"
                  >
                    <MessageCircle className="w-10 h-10 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold text-gray-800 mb-1">Nuevo Chat</div>
                    <div className="text-sm text-gray-600">Crear conversación</div>
                  </button>
                  <button className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group">
                    <Target className="w-10 h-10 text-green-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold text-gray-800 mb-1">Ver Torneos</div>
                    <div className="text-sm text-gray-600">Explorar quinielas</div>
                  </button>
                </div>
                {/* Instrucción visual */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center space-x-2 text-blue-700">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">💡 Haz clic en cualquier chat de la lista izquierda para comenzar</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar derecho */}
        {!selectedChat && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                  Mundial FIFA 2026
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Días restantes</span>
                    <span className="font-bold text-2xl text-blue-600">234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Países</span>
                    <span className="font-bold text-xl text-green-600">48</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Partidos</span>
                    <span className="font-bold text-xl text-purple-600">104</span>
                  </div>
                  <div className="text-center pt-2 border-t border-blue-200">
                    <div className="text-xs text-gray-600 mb-1">Sedes:</div>
                    <div className="text-sm font-semibold">🇺🇸 🇨🇦 🇲🇽</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <button className="w-full p-4 bg-yellow-100 hover:bg-yellow-200 rounded-xl text-left transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-yellow-800">Quinielas Activas</div>
                        <div className="text-xs text-yellow-600">Participar y ganar puntos</div>
                      </div>
                      <span className="text-xs bg-yellow-300 text-yellow-800 px-2 py-1 rounded-full font-bold">5</span>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-green-100 hover:bg-green-200 rounded-xl text-left transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-green-800">Tareas Pendientes</div>
                        <div className="text-xs text-green-600">Completar para ganar puntos</div>
                      </div>
                      <span className="text-xs bg-green-300 text-green-800 px-2 py-1 rounded-full font-bold">3</span>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-purple-100 hover:bg-purple-200 rounded-xl text-left transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-purple-800">Tienda</div>
                        <div className="text-xs text-purple-600">Comprar iconos</div>
                      </div>
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showNewChatModal && <NewChatModal />}
    </div>
  );
};

export default Dashboard;