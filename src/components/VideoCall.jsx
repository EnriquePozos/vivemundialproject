// src/components/VideoCall.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Room, RoomEvent, VideoPresets, Track } from 'livekit-client';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  Users,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import videoCallService from '../services/videoCallService';

/**
 * Componente de VideoCall usando LiveKit
 * MODIFICADO: Se integra en el área del chat (NO modal fullscreen)
 * Soporta llamadas 1 a 1 y grupales
 * 
 * @param {string} roomName - Nombre de la sala (si se une a una existente)
 */
const VideoCall = ({
  chatData,
  currentUser,
  onClose,
  isGroupCall = false,
  roomName = null, // ← NUEVO: Para unirse a salas existentes
}) => {
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const roomRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const hasInitialized = useRef(false);

  /**
   * Iniciar la videollamada
   */
  const iniciarLlamada = async () => {
    try {
      console.log('🎥 Iniciando videollamada...');

      let finalRoomName = roomName;

      // Si NO hay roomName, crear nueva llamada
      if (!finalRoomName) {
        console.log('📞 Creando nueva llamada...');
        const callResponse = await videoCallService.iniciarLlamada(
          chatData.id_Chat,
          isGroupCall ? 'grupal' : 'privada'
        );

        console.log('✅ Llamada iniciada:', callResponse.data);
        finalRoomName = callResponse.data.roomName;
      } else {
        console.log('🔗 Uniéndose a llamada existente:', finalRoomName);
      }

      // 2. Obtener token de LiveKit
      const tokenResponse = await videoCallService.obtenerToken(
        finalRoomName,
        currentUser.nombre_Usuario
      );

      console.log('✅ Token obtenido');

      const { token, url } = tokenResponse.data;

      // 3. Crear y conectar a la sala de LiveKit
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
      });

      roomRef.current = newRoom;
      setRoom(newRoom);

      // Configurar event listeners
      setupRoomListeners(newRoom);

      // 4. Conectar a la sala
      await newRoom.connect(url, token);
      console.log('✅ Conectado a la sala de LiveKit');

      // 5. Habilitar cámara y micrófono
      console.log('📹 Solicitando cámara y micrófono...');
      await newRoom.localParticipant.enableCameraAndMicrophone();
      console.log('📹 Cámara y micrófono habilitados');

      // 6. CAMBIAR ESTADO PARA QUE SE RENDERICE LA INTERFAZ
      setIsConnecting(false);
      setIsConnected(true);
      callStartTimeRef.current = Date.now();

      // 7. ESPERAR A QUE REACT RENDERICE EL DOM
      await new Promise(resolve => setTimeout(resolve, 100));

      // 8. Adjuntar video local
      if (newRoom.localParticipant && localVideoRef.current) {
        const videoPublications = Array.from(
          newRoom.localParticipant.videoTrackPublications?.values() || []
        );
        
        if (videoPublications.length > 0) {
          const publication = videoPublications[0];
          const track = publication.track || publication.videoTrack;
          
          if (track) {
            track.attach(localVideoRef.current);
            console.log('✅ Video local adjuntado correctamente');
          } else {
            console.warn('⚠️ Track no disponible');
          }
        } else {
          console.warn('⚠️ No hay video publications');
        }
      } else {
        console.error('❌ localVideoRef.current no disponible');
      }

      console.log('🎉 Videollamada lista!');

    } catch (err) {
      console.error('❌ Error al iniciar videollamada:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  };

  /**
   * Configurar listeners de eventos de la sala
   */
  const setupRoomListeners = (room) => {
    room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log('👤 Participante conectado:', participant.identity);
      actualizarListaParticipantes(room);
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('👋 Participante desconectado:', participant.identity);
      actualizarListaParticipantes(room);
      
      if (remoteVideosRef.current[participant.identity]) {
        delete remoteVideosRef.current[participant.identity];
      }
    });

    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log('🎬 Track recibido:', track.kind, 'de', participant.identity);

      if (track.kind === Track.Kind.Video) {
        const videoElement = remoteVideosRef.current[participant.identity];
        if (videoElement) {
          track.attach(videoElement);
        }
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      console.log('🔇 Track removido');
      track.detach();
    });
  };

  /**
   * Actualizar lista de participantes
   */
  const actualizarListaParticipantes = (room) => {
    const participantsList = Array.from(room.participants.values());
    setParticipants(participantsList);
  };

  /**
   * Alternar video local
   */
  const toggleVideo = async () => {
    if (room && room.localParticipant) {
      const enabled = !localVideoEnabled;
      await room.localParticipant.setCameraEnabled(enabled);
      setLocalVideoEnabled(enabled);
      console.log(enabled ? '📹 Video activado' : '🚫 Video desactivado');
    }
  };

  /**
   * Alternar audio local
   */
  const toggleAudio = async () => {
    if (room && room.localParticipant) {
      const enabled = !localAudioEnabled;
      await room.localParticipant.setMicrophoneEnabled(enabled);
      setLocalAudioEnabled(enabled);
      console.log(enabled ? '🎤 Audio activado' : '🔇 Audio desactivado');
    }
  };

  /**
   * Compartir pantalla
   */
  const toggleScreenShare = async () => {
    if (!room || !room.localParticipant) return;

    try {
      if (!isScreenSharing) {
        await room.localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
        console.log('🖥️ Compartiendo pantalla');
      } else {
        await room.localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
        console.log('🚫 Compartir pantalla detenido');
      }
    } catch (err) {
      console.error('Error al compartir pantalla:', err);
      alert('Error al compartir pantalla: ' + err.message);
    }
  };

  /**
   * Finalizar la videollamada
   */
  const finalizarLlamada = async () => {
    console.log('📞 Finalizando videollamada...');

    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    // Notificar al backend
    if (room?.name) {
      try {
        await videoCallService.finalizarLlamada(room.name);
        console.log('✅ Llamada finalizada en el backend');
      } catch (err) {
        console.error('Error al finalizar llamada:', err);
      }
    }

    // Llamar al callback de cierre
    if (onClose) {
      onClose();
    }
  };

  /**
   * Formatear duración de la llamada
   */
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // EFECTO PARA INICIAR LA LLAMADA (solo una vez)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      iniciarLlamada();
    }

    return () => {
      if (roomRef.current) {
        finalizarLlamada();
      }
    };
  }, []);

  // Timer para la duración de la llamada
  useEffect(() => {
    if (isConnected && callStartTimeRef.current) {
      timerIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(duration);
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isConnected]);

  // Render de error
  if (error) {
    return (
      // ← CAMBIO: Ya no es "fixed inset-0" sino que se adapta al contenedor
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error en la videollamada</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Render de conectando
  if (isConnecting) {
    return (
      // ← CAMBIO: Ya no es "fixed inset-0" sino que se adapta al contenedor
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Conectando...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // ← CAMBIO PRINCIPAL: Ya no es "fixed inset-0"
  // Ahora es "flex flex-col" para adaptarse al contenedor
  // ========================================
  return (
    <div className="bg-gray-900 flex flex-col h-full overflow-hidden">


      {/* Videos Container */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <div className={`h-full grid gap-2 p-4 ${
          participants.length === 0 ? 'grid-cols-1' :
          participants.length === 1 ? 'grid-cols-2' :
          participants.length <= 3 ? 'grid-cols-2 grid-rows-2' :
          'grid-cols-3 grid-rows-2'
        }`}>
          {/* Video Local */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Tú</span>
            </div>
            {!localVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <VideoOff className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Cámara desactivada</p>
                </div>
              </div>
            )}
          </div>

          {/* Videos Remotos */}
          {participants.map((participant) => (
            <div
              key={participant.identity}
              className="relative bg-gray-800 rounded-lg overflow-hidden"
            >
              <video
                ref={(el) => {
                  if (el) {
                    remoteVideosRef.current[participant.identity] = el;
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">
                  {participant.name || participant.identity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-3">
        <div className="flex items-center justify-center space-x-4">
          {/* Toggle Audio */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all ${
              localAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
            title={localAudioEnabled ? 'Desactivar micrófono' : 'Activar micrófono'}
          >
            {localAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Toggle Video */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              localVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
            title={localVideoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
          >
            {localVideoEnabled ? (
              <VideoIcon className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all ${
              isScreenSharing
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isScreenSharing ? 'Detener compartir pantalla' : 'Compartir pantalla'}
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>

          {/* End Call */}
          <button
            onClick={finalizarLlamada}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all"
            title="Finalizar llamada"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;