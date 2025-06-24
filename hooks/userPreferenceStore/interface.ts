// Definindo o tipo para os dispositivos de preferência (audio, video, etc.)
type DeviceType = 'audio' | 'video' | 'audioOutput';

// TODO: fazer tipagem
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