import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Login:', { email, password });
      // Llamar función del App.jsx para cambiar de página
      onLogin({ email, username: email.split('@')[0] });
    } else {
      console.log('Registro:', { username, email, password, confirmPassword });
      // También llamar función del App.jsx
      onLogin({ email, username });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚽</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Vive Mundial
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Inicia sesión para continuar' : '¡Crea tu cuenta y conecta con la afición!'}
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isLogin 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </div>

          {/* Toggle entre Login/Registro */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            </p>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className={`mt-2 font-semibold transition-colors duration-200 ${
                isLogin 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {isLogin ? 'Crear cuenta nueva' : 'Iniciar sesión'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white text-sm opacity-75">
          Vive Mundial 2026 • Chat & Predictions Platform
        </div>
      </div>
    </div>
  );
};

export default Login;