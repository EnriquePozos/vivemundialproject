import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateChat from './components/PrivateChat';

const App = () => {
  // Estado para controlar qué página mostrar
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'dashboard', 'chat'
  
  // Estado para guardar datos del usuario
  const [userData, setUserData] = useState(null);
  
  // Estado para el chat actual
  const [currentChat, setCurrentChat] = useState(null);

  // Función para manejar el login exitoso
  const handleLogin = (userInfo) => {
    console.log('Usuario logueado:', userInfo);
    setUserData(userInfo);
    setCurrentPage('dashboard');
  };

  // Función para manejar el logout
  const handleLogout = () => {
    console.log('Usuario deslogueado');
    setUserData(null);
    setCurrentChat(null);
    setCurrentPage('login');
  };

  // Función para abrir un chat específico
  const openChat = (chatData) => {
    console.log('Abriendo chat:', chatData);
    setCurrentChat(chatData);
    setCurrentPage('chat');
  };

  // Función para volver al dashboard desde el chat
  const backToDashboard = () => {
    setCurrentChat(null);
    setCurrentPage('dashboard');
  };

  // Renderizado condicional basado en currentPage
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      
      case 'dashboard':
        return (
          <Dashboard 
            userData={userData} 
            onLogout={handleLogout}
            onOpenChat={openChat}
          />
        );
      
      case 'chat':
        return (
          <PrivateChat 
            chatData={currentChat}
            userData={userData}
            onBack={backToDashboard}
          />
        );
      
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
};

export default App;