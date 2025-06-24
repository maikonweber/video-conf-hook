import { useCallback, useEffect, useMemo, useState } from "react";
import { usePreferencesStore } from "./userPreferenceStore";

interface UseUserMediaOptions {
  preferEnvironmentCamera?: boolean;
}

interface MediaConstraints {
  audio: string | boolean;
  video: string | boolean;
}

interface PermissionResult {
  video: boolean;
  audio: boolean;
}

interface SwitchInputResult {
  oldVideoTrack: MediaStreamTrack;
  newVideoTrack: MediaStreamTrack;
  oldAudioTrack: MediaStreamTrack;
  newAudioTrack: MediaStreamTrack;
  newStream: MediaStream;
}

const useUserMedia = ({ preferEnvironmentCamera = false }: UseUserMediaOptions = {}) => {
  const preferences = usePreferencesStore();
  const [stream, setStream] = useState<MediaStream | undefined>();
  const [activeStream, setActiveStream] = useState<MediaStream | undefined>();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [ready, setReady] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  const checkPermission = useCallback(async (): Promise<PermissionResult> => {
    try {
      const _stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setAccessGranted(true);
      stopStreaming(_stream);
      return { video: true, audio: true };
    } catch (error) {
      console.error("Error checking permission:", error);
      setAccessGranted(false);
      return { video: false, audio: false };
    }
  }, [setAccessGranted]);

  const stopStreaming = useCallback((_stream?: MediaStream) => {
    if (_stream) {
      _stream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<void> => {
    const _stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stopStreaming(_stream);
    checkPermission();
  }, [stopStreaming, checkPermission]);

  const updateUserMedia = useCallback(
    async (constraints: MediaConstraints): Promise<MediaStream> => {
      const _stream = await navigator.mediaDevices.getUserMedia({
        video: constraints.video && typeof constraints.video === 'string'
          ? { deviceId: { exact: constraints.video } }
          : !!constraints.video,
        audio: constraints.audio && typeof constraints.audio === 'string'
          ? { deviceId: { exact: constraints.audio } }
          : !!constraints.audio,
      });

      _stream.getVideoTracks().forEach((track) => {
        track.enabled = !preferences.videoOff;
      });

      _stream.getAudioTracks().forEach((track) => {
        track.enabled = !preferences.muted;
      });

      setActiveStream(_stream);
      setReady(true);
      return _stream;
    },
    [preferences.muted, preferences.videoOff],
  );

  const getDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setDevices(devices || []);
    return devices;
  }, [setDevices]);

  const toggleMute = useCallback(() => {
    activeStream?.getAudioTracks().forEach((track) => {
      track.enabled = preferences.muted;
    });
    preferences.toggleMute();
  }, [preferences, activeStream]);

  const toggleVideo = useCallback(() => {
    activeStream?.getVideoTracks().forEach((track) => {
      track.enabled = preferences.videoOff;
    });
    preferences.toggleVideoOff();
  }, [preferences, activeStream]);

  const switchAudioOutput = useCallback(
    (deviceId: string) => {
      preferences.set(deviceId, "audioOutput");
    },
    [preferences],
  );

  const switchInput = useCallback(
    async (deviceId: string, type: 'audio' | 'video'): Promise<SwitchInputResult | undefined> => {
      let newStream: MediaStream;
      const oldVideoTrack = activeStream?.getVideoTracks()[0];
      const oldAudioTrack = activeStream?.getAudioTracks()[0];

      if (!oldVideoTrack || !oldAudioTrack) {
        return undefined;
      }

      if (type === "audio") {
        newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
          video: { deviceId: { exact: preferences.video } },
        });
        preferences.set(deviceId, "audio");
      } else {
        newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: preferences.audio } },
          video: { deviceId: { exact: deviceId } },
        });
        preferences.set(deviceId, "video");
      }

      if (!newStream) return undefined;

      const newVideoTrack = newStream.getVideoTracks()[0];
      const newAudioTrack = newStream.getAudioTracks()[0];

      newVideoTrack.enabled = !preferences.videoOff;
      newAudioTrack.enabled = !preferences.muted;

      stopStreaming(activeStream);
      setActiveStream(newStream);

      return {
        oldVideoTrack,
        newVideoTrack,
        oldAudioTrack,
        newAudioTrack,
        newStream,
      };
    },
    [activeStream, preferences, stopStreaming],
  );

  const stopAllStreaming = useCallback(async (): Promise<void> => {
    stream?.getTracks().forEach((track) => track.stop());
  }, [stream]);

  useEffect(() => {
    if (accessGranted) {
      getDevices();
    }
  }, [getDevices, accessGranted]);

  const audioDevices = useMemo(() => {
    return devices.filter(
      (device) => device.kind === "audioinput" && !!device.deviceId,
    );
  }, [devices]);

  const outputDevices = useMemo(() => {
    return devices.filter(
      (device) => device.kind === "audiooutput" && !!device.deviceId,
    );
  }, [devices]);

  const videoDevices = useMemo(() => {
    return devices.filter(
      (device) => device.kind === "videoinput" && !!device.deviceId,
    );
  }, [devices]);

  useEffect(() => {
    const init = async () => {
      const permission = await checkPermission();

      if (!permission.audio || !permission.video) {
        requestPermission();
      }
    };

    init();
  }, [checkPermission, getDevices, requestPermission]);

  useEffect(() => {
    const init = async () => {
      const _devices = await getDevices();

      let audio = preferences.audio || undefined;
      let video = preferences.video || undefined;
      let audioOutput = preferences.audioOutput || undefined;

      if (!_devices || !_devices.length) {
        console.log("No devices found");
        return;
      }

      // Se preferir a câmera "environment", procure por ela
      if (preferEnvironmentCamera) {
        const environmentCamera = _devices.find(
          (device) =>
            device.kind === "videoinput" &&
            device.label.toLowerCase().includes("environment"),
        );

        if (environmentCamera) {
          video = environmentCamera.deviceId;
          console.log("Using environment camera:", environmentCamera.label);
        } else {
          console.log("Environment camera not found");
        }
      }

      // Fallback para procurar a câmera traseira se "environment" não foi encontrado
      if (!video) {
        const backCamera =
          _devices.find(
            (device) =>
              device.kind === "videoinput" &&
              device.label.toLowerCase().includes("back"),
          ) ||
          _devices.find(
            (device) =>
              device.kind === "videoinput" &&
              device.label.toLowerCase().includes("environment"),
          );

        video = backCamera
          ? backCamera.deviceId
          : _devices.find((device) => device.kind === "videoinput")?.deviceId;

        if (backCamera) {
          console.log("Using back camera:", backCamera.label);
        } else {
          console.log("Using default camera:", video);
        }
      }

      if (!audio) {
        const defaultAudio = _devices.find(
          (device) => device.kind === "audioinput",
        );
        audio = defaultAudio?.deviceId;
        if (!defaultAudio) console.warn("No audio input found.");
      }

      if (!video) {
        const defaultVideo = _devices.find(
          (device) => device.kind === "videoinput",
        );
        video = defaultVideo?.deviceId;
        if (!defaultVideo) console.warn("No video input found.");
      }

      if (!audioOutput) {
        const defaultOutput = _devices.find(
          (device) => device.kind === "audiooutput",
        );
        audioOutput = defaultOutput?.deviceId;
        if (!defaultOutput) console.warn("No audio output found.");
      }

      if (video) {
        preferences.set(video, "video");
      }

      if (audio) {
        preferences.set(audio, "audio");
      }

      if (audioOutput) {
        preferences.set(audioOutput, "audioOutput");
      }

      const _stream = await updateUserMedia({
        audio: audio || true,
        video: video || true,
      });

      setStream(_stream);
      setActiveStream(_stream);
    };

    if (accessGranted && !stream) {
      init();
    }
  }, [
    updateUserMedia,
    accessGranted,
    stream,
    getDevices,
    preferEnvironmentCamera,
  ]);

  return {
    stream,
    activeStream,
    audioDevices,
    videoDevices,
    outputDevices,
    selectedAudioDevice: preferences.audio,
    selectedVideoDevice: preferences.video,
    selectedOutputDevice: preferences.audioOutput,
    ready,
    accessGranted,
    switchInput,
    stopStreaming,
    stopAllStreaming,
    toggleMute,
    toggleVideo,
    switchAudioOutput,
    muted: preferences.muted,
    videoOff: preferences.videoOff,
    checkPermission,
  };
};

export default useUserMedia; 