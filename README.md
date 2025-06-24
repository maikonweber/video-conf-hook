# react-media-devices

![npm version](https://img.shields.io/npm/v/react-media-devices)
![license](https://img.shields.io/npm/l/react-media-devices)
![downloads](https://img.shields.io/npm/dm/react-media-devices)

React hooks para gerenciar dispositivos de mídia, permissões e streams para aplicações de videoconferência.

## 🚀 Funcionalidades

- ✅ **Gerenciamento de dispositivos** - Acesso e controle de câmeras, microfones e alto-falantes
- ✅ **Permissões automáticas** - Verificação e solicitação de permissões de mídia
- ✅ **Estado persistente** - Preferências de dispositivos salvas automaticamente (Zustand)
- ✅ **Controles de mídia** - Alternar mute/unmute e vídeo on/off
- ✅ **Troca de dispositivos** - Mudança dinâmica de câmera e microfone
- ✅ **TypeScript** - Totalmente tipado para melhor experiência de desenvolvimento
- ✅ **Câmera traseira** - Suporte preferencial para câmera "environment" em dispositivos móveis

## 📦 Instalação

```bash
npm install react-media-devices zustand
```

```bash
yarn add react-media-devices zustand
```

```bash
pnpm add react-media-devices zustand
```

> **Nota:** `zustand` é uma dependência peer, então você precisa instalá-la separadamente.

## 🔧 Uso Básico

### useUserMedia

Hook principal para gerenciar streams de mídia e dispositivos:

```tsx
import React, { useRef, useEffect } from 'react';
import { useUserMedia } from 'react-media-devices';

function VideoConference() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const {
    activeStream,
    audioDevices,
    videoDevices,
    outputDevices,
    ready,
    muted,
    videoOff,
    toggleMute,
    toggleVideo,
    switchInput,
    switchAudioOutput,
  } = useUserMedia({
    preferEnvironmentCamera: true // Prefere câmera traseira em mobile
  });

  // Conectar stream ao elemento de vídeo
  useEffect(() => {
    if (videoRef.current && activeStream) {
      videoRef.current.srcObject = activeStream;
    }
  }, [activeStream]);

  if (!ready) {
    return <div>Carregando dispositivos...</div>;
  }

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      
      {/* Controles básicos */}
      <div>
        <button onClick={toggleMute}>
          {muted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
        
        <button onClick={toggleVideo}>
          {videoOff ? '📷 Liga Vídeo' : '🚫 Desliga Vídeo'}
        </button>
      </div>

      {/* Seletor de câmera */}
      <select onChange={(e) => switchInput(e.target.value, 'video')}>
        {videoDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Câmera ${device.deviceId.substring(0, 8)}`}
          </option>
        ))}
      </select>

      {/* Seletor de microfone */}
      <select onChange={(e) => switchInput(e.target.value, 'audio')}>
        {audioDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microfone ${device.deviceId.substring(0, 8)}`}
          </option>
        ))}
      </select>

      {/* Seletor de saída de áudio */}
      <select onChange={(e) => switchAudioOutput(e.target.value)}>
        {outputDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Alto-falante ${device.deviceId.substring(0, 8)}`}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### usePreferencesStore

Hook para gerenciar preferências de dispositivos (usado internamente pelo `useUserMedia`):

```tsx
import { usePreferencesStore } from 'react-media-devices';

function DeviceSettings() {
  const preferences = usePreferencesStore();

  return (
    <div>
      <p>Câmera selecionada: {preferences.video}</p>
      <p>Microfone selecionado: {preferences.audio}</p>
      <p>Saída de áudio: {preferences.audioOutput}</p>
      <p>Mudo: {preferences.muted ? 'Sim' : 'Não'}</p>
      <p>Vídeo off: {preferences.videoOff ? 'Sim' : 'Não'}</p>
    </div>
  );
}
```

## 📚 API Reference

### useUserMedia(options?)

#### Parâmetros

- `options` (opcional):
  - `preferEnvironmentCamera?: boolean` - Se `true`, tenta usar a câmera traseira em dispositivos móveis

#### Retorna

```typescript
{
  // Streams
  stream?: MediaStream;           // Stream inicial
  activeStream?: MediaStream;     // Stream ativo atual
  
  // Estados
  ready: boolean;                 // Se os dispositivos estão prontos
  accessGranted: boolean;         // Se as permissões foram concedidas
  muted: boolean;                 // Estado atual do áudio
  videoOff: boolean;              // Estado atual do vídeo
  
  // Listas de dispositivos
  audioDevices: MediaDeviceInfo[];    // Microfones disponíveis
  videoDevices: MediaDeviceInfo[];    // Câmeras disponíveis  
  outputDevices: MediaDeviceInfo[];   // Alto-falantes disponíveis
  
  // Dispositivos selecionados
  selectedAudioDevice?: string;       // ID do microfone selecionado
  selectedVideoDevice?: string;       // ID da câmera selecionada
  selectedOutputDevice?: string;      // ID do alto-falante selecionado
  
  // Funções de controle
  toggleMute: () => void;                              // Alterna mute/unmute
  toggleVideo: () => void;                             // Alterna vídeo on/off
  switchInput: (deviceId: string, type: 'audio' | 'video') => Promise<SwitchResult>;
  switchAudioOutput: (deviceId: string) => void;      // Troca saída de áudio
  stopStreaming: (stream?: MediaStream) => void;       // Para stream específico
  stopAllStreaming: () => Promise<void>;               // Para todos os streams
  checkPermission: () => Promise<PermissionResult>;    // Verifica permissões
}
```

#### Tipos

```typescript
interface SwitchResult {
  oldVideoTrack: MediaStreamTrack;
  newVideoTrack: MediaStreamTrack;
  oldAudioTrack: MediaStreamTrack;
  newAudioTrack: MediaStreamTrack;
  newStream: MediaStream;
}

interface PermissionResult {
  video: boolean;
  audio: boolean;
}
```

### usePreferencesStore

Estado global para preferências de dispositivos (powered by Zustand):

```typescript
interface IPreferencesState {
  audio?: string;                                    // ID do dispositivo de áudio
  video?: string;                                    // ID do dispositivo de vídeo  
  audioOutput?: string;                              // ID da saída de áudio
  muted: boolean;                                    // Estado mudo
  videoOff: boolean;                                 // Estado vídeo off
  set: (deviceId: string, type: DeviceType) => void; // Define dispositivo
  toggleMute: () => void;                            // Alterna mudo
  toggleVideoOff: () => void;                        // Alterna vídeo
}
```

## 🎯 Casos de Uso

### 1. Aplicação de Videoconferência Simples

```tsx
import React from 'react';
import { useUserMedia } from 'react-media-devices';

function MeetingRoom() {
  const {
    activeStream,
    ready,
    muted,
    videoOff,
    toggleMute,
    toggleVideo
  } = useUserMedia();

  return (
    <div className="meeting-room">
      {ready && (
        <>
          <video 
            ref={ref => ref && (ref.srcObject = activeStream)}
            autoPlay 
            muted 
            className="local-video"
          />
          
          <div className="controls">
            <button 
              onClick={toggleMute}
              className={muted ? 'muted' : 'active'}
            >
              {muted ? '🔇' : '🎤'}
            </button>
            
            <button 
              onClick={toggleVideo}
              className={videoOff ? 'off' : 'active'}
            >
              {videoOff ? '📷' : '🎥'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### 2. Configurações Avançadas de Dispositivos

```tsx
import React from 'react';
import { useUserMedia, usePreferencesStore } from 'react-media-devices';

function DeviceSettings() {
  const preferences = usePreferencesStore();
  const {
    audioDevices,
    videoDevices,
    outputDevices,
    switchInput,
    switchAudioOutput
  } = useUserMedia();

  return (
    <div className="device-settings">
      <h3>Configurações de Dispositivos</h3>
      
      <div>
        <label>Câmera:</label>
        <select 
          value={preferences.video || ''} 
          onChange={(e) => switchInput(e.target.value, 'video')}
        >
          {videoDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Microfone:</label>
        <select 
          value={preferences.audio || ''} 
          onChange={(e) => switchInput(e.target.value, 'audio')}
        >
          {audioDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Alto-falante:</label>
        <select 
          value={preferences.audioOutput || ''} 
          onChange={(e) => switchAudioOutput(e.target.value)}
        >
          {outputDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

### 3. Componente com Verificação de Permissões

```tsx
import React, { useState } from 'react';
import { useUserMedia } from 'react-media-devices';

function PermissionGate({ children }) {
  const { accessGranted, checkPermission } = useUserMedia();
  const [requesting, setRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setRequesting(true);
    try {
      await checkPermission();
    } finally {
      setRequesting(false);
    }
  };

  if (!accessGranted) {
    return (
      <div className="permission-gate">
        <h2>Permissões Necessárias</h2>
        <p>Esta aplicação precisa acessar sua câmera e microfone.</p>
        <button 
          onClick={handleRequestPermission}
          disabled={requesting}
        >
          {requesting ? 'Solicitando...' : 'Permitir Acesso'}
        </button>
      </div>
    );
  }

  return children;
}
```

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm test

# Lint
npm run lint
```

## 📄 Licença

MIT © [Maikon Weber](https://github.com/maikweber)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🐛 Reportar Bugs

Encontrou um bug? [Abra uma issue](https://github.com/maikweber/react-media-devices/issues)

## ⭐ Suporte

Se este projeto te ajudou, considere dar uma ⭐ no GitHub! 