import { useState, useEffect } from "react";

const useMediaPermissions = () => {
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setPermissionsGranted(true);
      } catch (error) {
        setPermissionsGranted(false);
      }
    };

    getPermissions();
  }, []);

  return permissionsGranted;
};

export default useMediaPermissions;
