import { useState, useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import {
  setActiveCameraDeviceId,
  setActiveMicrophoneDeviceId,
  setDevices,
} from "../store/features/mediaPreferences/mediaPreferencesSlice";

const useMediaPermissions = () => {
  const dispatch = useAppDispatch();

  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(
    null
  );

  const getPermissions = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();

      dispatch(setDevices(deviceList));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      const videoDeviceId = videoTrack.getSettings().deviceId;
      const audioDeviceId = audioTrack.getSettings().deviceId;

      setPermissionsGranted(true);

      if (videoDeviceId) dispatch(setActiveCameraDeviceId(videoDeviceId));
      if (audioDeviceId) dispatch(setActiveMicrophoneDeviceId(audioDeviceId));

      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      setPermissionsGranted(false);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  return permissionsGranted;
};

export default useMediaPermissions;
