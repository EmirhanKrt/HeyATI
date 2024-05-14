import { useState, useEffect } from "react";

type MediaPermissions = {
  camera: boolean;
  microphone: boolean;
};

const useMediaPermissions = (): MediaPermissions => {
  const [permissions, setPermissions] = useState<MediaPermissions>({
    camera: false,
    microphone: false,
  });

  const checkPermissions = async () => {
    try {
      const cameraGranted = await navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then(() => true)
        .catch(() => false);

      const microphoneGranted = await navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(() => true)
        .catch(() => false);

      setPermissions({
        camera: cameraGranted,
        microphone: microphoneGranted,
      });
    } catch (error) {
      console.error("Error checking media permissions:", error);
      setPermissions({ camera: false, microphone: false });
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return permissions;
};

export default useMediaPermissions;
