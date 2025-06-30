<div align="center">
  <img src="logo.png" alt="StreamDevices Logo" width="200" height="200">
  
  # StreamDevices
  
  ### 🎥 React Hooks para Gerenciamento Avançado de Dispositivos de Mídia
  
  [![npm version](https://img.shields.io/npm/v/react-media-devices?style=for-the-badge&color=blue)](https://www.npmjs.com/package/react-media-devices)
  [![license](https://img.shields.io/npm/l/react-media-devices?style=for-the-badge&color=green)](https://github.com/maikweber/react-media-devices/blob/main/LICENSE)
  [![downloads](https://img.shields.io/npm/dm/react-media-devices?style=for-the-badge&color=orange)](https://www.npmjs.com/package/react-media-devices)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  
  **Solução completa para aplicações de videoconferência com gerenciamento inteligente de dispositivos de mídia**
  
  [📖 Documentação](#-documentação) • [🚀 Instalação](#-instalação) • [💡 Exemplos](#-exemplos) • [🤝 Contribuir](#-contribuindo)
</div>

---

## ✨ Funcionalidades Principais

<table>
  <tr>
    <td align="center" width="50%">
      <h3>🎯 Gerenciamento Inteligente</h3>
      <ul align="left">
        <li>✅ Acesso e controle de câmeras, microfones e alto-falantes</li>
        <li>✅ Verificação e solicitação automática de permissões</li>
        <li>✅ Estado persistente com Zustand</li>
        <li>✅ Troca dinâmica de dispositivos</li>
      </ul>
    </td>
    <td align="center" width="50%">
      <h3>🎮 Controles Avançados</h3>
      <ul align="left">
        <li>✅ Alternar mute/unmute e vídeo on/off</li>
        <li>✅ Suporte preferencial para câmera traseira</li>
        <li>✅ TypeScript totalmente tipado</li>
        <li>✅ Interface moderna e intuitiva</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Instalação Rápida

```bash
# NPM
npm install react-media-devices zustand

# Yarn
yarn add react-media-devices zustand

# PNPM
pnpm add react-media-devices zustand
```

> **💡 Nota:** `zustand` é uma dependência peer necessária para o gerenciamento de estado.

---

## 💡 Exemplos de Uso

### 🎥 Aplicação de Videoconferência Básica

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
    preferEnvironmentCamera: true // 🎯 Prefere câmera traseira em mobile
  });

  // 🔗 Conectar stream ao elemento de vídeo
  useEffect(() => {
    if (videoRef.current && activeStream) {
      videoRef.current.srcObject = activeStream;
    }
  }, [activeStream]);

  if (!ready) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando dispositivos...</p>
      </div>
    );
  }

  return (
    <div className="video-conference">
      <video ref={videoRef} autoPlay muted className="local-video" />
      
      {/* 🎮 Controles básicos */}
      <div className="controls">
        <button onClick={toggleMute} className={`control-btn ${muted ? 'muted' : 'active'}`}>
          {muted ? '🔇 Unmute' : '🎤 Mute'}
        </button>
        
        <button onClick={toggleVideo} className={`control-btn ${videoOff ? 'off' : 'active'}`}>
          {videoOff ? '📷 Liga Vídeo' : '🎥 Desliga Vídeo'}
        </button>
      </div>

      {/* 📹 Seletor de câmera */}
      <select onChange={(e) => switchInput(e.target.value, 'video')} className="device-select">
        {videoDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `📹 Câmera ${device.deviceId.substring(0, 8)}`}
          </option>
        ))}
      </select>

      {/* 🎤 Seletor de microfone */}
      <select onChange={(e) => switchInput(e.target.value, 'audio')} className="device-select">
        {audioDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `🎤 Microfone ${device.deviceId.substring(0, 8)}`}
          </option>
        ))}
      </select>

      {/* 🔊 Seletor de saída de áudio */}
      <select onChange={(e) => switchAudioOutput(e.target.value)} className="device-select">
        {outputDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `🔊 Alto-falante ${device.deviceId.substring(0, 8)}`}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### ⚙️ Configurações Avançadas de Dispositivos

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
      <h3>⚙️ Configurações de Dispositivos</h3>
      
      <div className="setting-group">
        <label>📹 Câmera:</label>
        <select 
          value={preferences.video || ''} 
          onChange={(e) => switchInput(e.target.value, 'video')}
          className="device-select"
        >
          {videoDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label>🎤 Microfone:</label>
        <select 
          value={preferences.audio || ''} 
          onChange={(e) => switchInput(e.target.value, 'audio')}
          className="device-select"
        >
          {audioDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label>🔊 Alto-falante:</label>
        <select 
          value={preferences.audioOutput || ''} 
          onChange={(e) => switchAudioOutput(e.target.value)}
          className="device-select"
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

### 🔐 Componente com Verificação de Permissões

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
        <div className="permission-content">
          <h2>🔐 Permissões Necessárias</h2>
          <p>Esta aplicação precisa acessar sua câmera e microfone para funcionar corretamente.</p>
          <button 
            onClick={handleRequestPermission}
            disabled={requesting}
            className="permission-btn"
          >
            {requesting ? '⏳ Solicitando...' : '✅ Permitir Acesso'}
          </button>
        </div>
      </div>
    );
  }

  return children;
}
```

---

## 📚 Documentação da API

### `useUserMedia(options?)`

#### 🎯 Parâmetros

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `preferEnvironmentCamera` | `boolean` | `false` | Prefere câmera traseira em dispositivos móveis |

#### 📤 Retorna

```typescript
{
  // 🌊 Streams
  stream?: MediaStream;           // Stream inicial
  activeStream?: MediaStream;     // Stream ativo atual
  
  // 📊 Estados
  ready: boolean;                 // Dispositivos prontos
  accessGranted: boolean;         // Permissões concedidas
  muted: boolean;                 // Estado do áudio
  videoOff: boolean;              // Estado do vídeo
  
  // 📱 Dispositivos
  audioDevices: MediaDeviceInfo[];    // Microfones disponíveis
  videoDevices: MediaDeviceInfo[];    // Câmeras disponíveis  
  outputDevices: MediaDeviceInfo[];   // Alto-falantes disponíveis
  
  // 🎯 Selecionados
  selectedAudioDevice?: string;       // ID do microfone
  selectedVideoDevice?: string;       // ID da câmera
  selectedOutputDevice?: string;      // ID do alto-falante
  
  // 🎮 Controles
  toggleMute: () => void;                              // Alterna mute/unmute
  toggleVideo: () => void;                             // Alterna vídeo on/off
  switchInput: (deviceId: string, type: 'audio' | 'video') => Promise<SwitchResult>;
  switchAudioOutput: (deviceId: string) => void;      // Troca saída de áudio
  stopStreaming: (stream?: MediaStream) => void;       // Para stream específico
  stopAllStreaming: () => Promise<void>;               // Para todos os streams
  checkPermission: () => Promise<PermissionResult>;    // Verifica permissões
}
```

#### 🔧 Tipos

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

### `usePreferencesStore`

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

---

## 🛠️ Desenvolvimento

```bash
# 📦 Instalar dependências
npm install

# 🚀 Desenvolvimento
npm run dev

# 🏗️ Build
npm run build

# 🧪 Testes
npm test

# 🔍 Lint
npm run lint
```

---

## 👥 Autores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/maikonweber">
        <img src="https://github.com/maikonweber.png" width="100px;" alt="Maikon Weber"/>
        <br />
        <sub><b>Maikon Weber</b></sub>
      </a>
      <br />
      <sub>🚀 Desenvolvimento inicial</sub>
    </td>
    <td align="center">
      <a href="https://github.com/dougdotcon">
        <img src="https://github.com/dougdotcon.png" width="100px;" alt="Douglas Machado"/>
        <br />
        <sub><b>Douglas Machado</b></sub>
      </a>
      <br />
      <sub>💻 Desenvolvimento inicial</sub>
    </td>
  </tr>
</table>

---

## 📄 Licença

<div align="center">
  
  **MIT © [Maikon Weber](https://github.com/maikweber)**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  
</div>

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! 🎉

### 📋 Como Contribuir

1. 🍴 Faça um fork do projeto
2. 🌿 Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push para a branch (`git push origin feature/AmazingFeature`)
5. 🔄 Abra um Pull Request

### 🐛 Reportar Bugs

Encontrou um bug? [Abra uma issue](https://github.com/maikweber/react-media-devices/issues) e nos ajude a melhorar!

### ⭐ Suporte

Se este projeto te ajudou, considere dar uma ⭐ no GitHub! 

---

<div align="center">
  
  **Feito com ❤️ pela comunidade StreamDevices**
  
  [![GitHub stars](https://img.shields.io/github/stars/maikweber/react-media-devices?style=social)](https://github.com/maikweber/react-media-devices)
  [![GitHub forks](https://img.shields.io/github/forks/maikweber/react-media-devices?style=social)](https://github.com/maikweber/react-media-devices)
  [![GitHub issues](https://img.shields.io/github/issues/maikweber/react-media-devices)](https://github.com/maikweber/react-media-devices/issues)
  
</div> 