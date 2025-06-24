import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { IPreferencesState } from "./interface";

const usePreferencesStore = create((set) => ({
  audio: undefined,
  video: undefined,
  audioOutput: undefined,
  muted: false,
  videoOff: false,
  set: (deviceId: any, type: any) => set({ [type]: deviceId }),
  toggleMute: () => set((state: any) => ({ muted: !state.muted })),
  toggleVideoOff: () => set((state: any) => ({ videoOff: !state.videoOff })),
}));

export { usePreferencesStore };
