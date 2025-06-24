// Definindo o tipo para os dispositivos de preferência (audio, video, etc.)
export type DeviceType = 'audio' | 'video' | 'audioOutput';

export interface IPreferencesState {
  audio?: string;
  video?: string;
  audioOutput?: string;
  muted: boolean;
  videoOff: boolean;
  set: (deviceId: string, type: DeviceType) => void;
  toggleMute: () => void;
  toggleVideoOff: () => void;
} 