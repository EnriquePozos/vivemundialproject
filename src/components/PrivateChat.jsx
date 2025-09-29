import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  ArrowLeft,
  Trophy,
  Target,
  CheckCircle,
  Clock,
  Coins,
  Plus,
  User,
  Shield,
  ShieldOff,
  MapPin,
  Image,
  FileText,
  Mic
} from 'lucide-react';

const PrivateChat = ({ chatData, onBack }) => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('quinielas');
  const [showNewQuinielaModal, setShowNewQuinielaModal] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);

  // Mock data del chat
  const currentChat = {
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

  // Quinielas activas en el chat privado
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

  // Tareas específicas del chat privado
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
    alert('Iniciando videollamada con Cynthia Sustaita...');
  };

  const startVoiceCall = () => {
    console.log('Iniciando llamada de voz');
    alert('Iniciando llamada de voz con Cynthia Sustaita...');
  };

  // Modal para nueva quiniela
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Botón volver */}
            <button 
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Info del contacto */}
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
            {/* Botones de llamada */}
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
            
            {/* Cifrado de mensajes */}
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
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
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

          {/* Message Input */}
          <div className="p-6 bg-white border-t border-gray-200">
            {/* Cifrado indicator */}
            {encryptionEnabled && (
              <div className="mb-3 flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <Shield className="w-4 h-4" />
                <span>Los mensajes están cifrados de extremo a extremo</span>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {/* Botones de archivos */}
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

        {/* Right Panel - Quinielas y Tareas */}
        <div className="w-80 bg-white border-l border-gray-200">
          {/* Panel Tabs */}
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

      {/* Modal */}
      {showNewQuinielaModal && <NewQuinielaModal />}
    </div>
  );
};

export default PrivateChat;