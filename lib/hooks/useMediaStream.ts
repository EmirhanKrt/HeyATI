import { useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";

export const useMediaStream = () => {
  const { isCameraActive, isMicrophoneActive, isScreenSharingActive } =
    useAppSelector((state) => state.videoChat);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(
    null
  );
  const [screenShareStream, setScreenShareStream] =
    useState<MediaStream | null>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      if (isCameraActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setCameraStream(stream);
        } catch (error) {
          console.error("Error accessing camera.", error);
        }
      } else {
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
        }
        setCameraStream(null);
      }
    };

    getCameraStream();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  useEffect(() => {
    const getMicrophoneStream = async () => {
      if (isMicrophoneActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          setMicrophoneStream(stream);
        } catch (error) {
          console.error("Error accessing microphone.", error);
        }
      } else {
        if (microphoneStream) {
          microphoneStream.getTracks().forEach((track) => track.stop());
        }
        setMicrophoneStream(null);
      }
    };

    getMicrophoneStream();

    return () => {
      if (microphoneStream) {
        microphoneStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMicrophoneActive]);

  useEffect(() => {
    const getScreenShareStream = async () => {
      if (isScreenSharingActive) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          setScreenShareStream(stream);
        } catch (error) {
          console.error("Error accessing screen sharing.", error);
        }
      } else {
        if (screenShareStream) {
          screenShareStream.getTracks().forEach((track) => track.stop());
        }
        setScreenShareStream(null);
      }
    };

    getScreenShareStream();

    return () => {
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isScreenSharingActive]);

  return { cameraStream, microphoneStream, screenShareStream };
};
