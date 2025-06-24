import { create } from "zustand";
import { IPreferencesState, DeviceType } from "./interface";

const usePreferencesStore = create<IPreferencesState>((set) => ({
  audio: undefined,
  video: undefined,
  audioOutput: undefined,
  muted: false,
  videoOff: false,
  set: (deviceId: string, type: DeviceType) => set({ [type]: deviceId }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  toggleVideoOff: () => set((state) => ({ videoOff: !state.videoOff })),
}));

export { usePreferencesStore }; 