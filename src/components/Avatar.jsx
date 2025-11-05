import React from 'react';
import { User } from 'lucide-react';

/**
 * Componente Avatar
 * Muestra el emoji equipado del usuario o un icono por defecto
 * 
 * @param {Object} props
 * @param {string} props.iconoPerfil - Emoji o 'default_avatar.png'
 * @param {string} props.size - Tamaño: 'sm', 'md', 'lg', 'xl'
 * @param {string} props.className - Clases CSS adicionales
 */
const Avatar = ({ iconoPerfil, size = 'md', className = '' }) => {
  // Definir tamaños
  const sizes = {
    sm: 'w-8 h-8 text-lg',      // 32px - emoji: 18px
    md: 'w-10 h-10 text-xl',    // 40px - emoji: 20px
    lg: 'w-12 h-12 text-2xl',   // 48px - emoji: 24px
    xl: 'w-16 h-16 text-4xl'    // 64px - emoji: 36px
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  // Verificar si tiene un emoji equipado
  const hasEmoji = iconoPerfil && 
                   iconoPerfil !== 'default_avatar.png' && 
                   iconoPerfil.trim() !== '';

  return (
    <div 
      className={`
        ${sizes[size]} 
        bg-gradient-to-br from-blue-500 to-purple-600 
        rounded-full 
        flex items-center justify-center 
        flex-shrink-0
        ${className}
      `}
    >
      {hasEmoji ? (
        <span className="leading-none">{iconoPerfil}</span>
      ) : (
        <User className={`${iconSizes[size]} text-white`} />
      )}
    </div>
  );
};

export default Avatar;