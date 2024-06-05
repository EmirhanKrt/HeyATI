import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setScreenShareClosed } from "../store/features/mediaPreferences/mediaPreferencesSlice";

export const useMediaStream = () => {
  const dispatch = useAppDispatch();

  const {
    isCameraActive,
    isMicrophoneActive,
    isScreenSharingActive,
    activeCameraDeviceId,
    activeMicrophoneDeviceId,
  } = useAppSelector((state) => state.mediaPreferences);

  const generateEmptyAudioTrack = () => {
    return new AudioContext()
      .createMediaStreamDestination()
      .stream.getAudioTracks()[0];
  };

  const generateEmptyVideoTrack = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;

    const context = canvas.getContext("2d");

    if (context) {
      context.fillStyle = "#151515";
      context.fillRect(0, 0, 100, 100);
    }

    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];

    return Object.assign(track, { enabled: false });
  };

  const [cameraStream, setCameraStream] = useState<MediaStream>(
    new MediaStream([generateEmptyVideoTrack()])
  );

  const [microphoneStream, setMicrophoneStream] = useState<MediaStream>(
    new MediaStream([generateEmptyAudioTrack()])
  );

  const [screenShareStream, setScreenShareStream] = useState<MediaStream>(
    new MediaStream([generateEmptyVideoTrack()])
  );

  useEffect(() => {
    const getCameraStream = async () => {
      if (isCameraActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: activeCameraDeviceId
                ? { exact: activeCameraDeviceId }
                : undefined,
            },
          });
          setCameraStream(stream);
        } catch (error) {
          console.error("Error accessing camera.", error);
        }
      } else {
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
        }
        setCameraStream(new MediaStream([generateEmptyVideoTrack()]));
      }
    };

    getCameraStream();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive, activeCameraDeviceId]);

  useEffect(() => {
    const getMicrophoneStream = async () => {
      if (isMicrophoneActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: activeMicrophoneDeviceId
                ? { exact: activeMicrophoneDeviceId }
                : undefined,
            },
          });
          setMicrophoneStream(stream);
        } catch (error) {
          console.error("Error accessing microphone.", error);
        }
      } else {
        if (microphoneStream) {
          microphoneStream.getTracks().forEach((track) => track.stop());
        }
        setMicrophoneStream(new MediaStream([generateEmptyAudioTrack()]));
      }
    };

    getMicrophoneStream();

    return () => {
      if (microphoneStream) {
        microphoneStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMicrophoneActive, activeMicrophoneDeviceId]);

  useEffect(() => {
    const getScreenShareStream = async () => {
      if (isScreenSharingActive) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          setScreenShareStream(stream);

          stream.getVideoTracks()[0].addEventListener("ended", () => {
            dispatch(setScreenShareClosed());
          });
        } catch (error) {
          console.error("Error accessing screen sharing.", error);
          dispatch(setScreenShareClosed());
        }
      } else {
        if (screenShareStream) {
          screenShareStream.getTracks().forEach((track) => track.stop());
        }
        setScreenShareStream(new MediaStream([generateEmptyVideoTrack()]));
      }
    };

    getScreenShareStream();

    return () => {
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isScreenSharingActive]);

  return {
    cameraStream,
    microphoneStream,
    screenShareStream,
  };
};
