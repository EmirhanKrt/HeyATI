"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toggleCamera } from "@/lib/store/features/mediaPreferences/mediaPreferencesSlice";

const CameraButton = () => {
  const isCameraActive = useAppSelector(
    (state) => state.mediaPreferences.isCameraActive
  );
  const dispatch = useAppDispatch();

  return (
    <button
      className="icon-button"
      onClick={() => dispatch(toggleCamera())}
      style={isCameraActive ? { background: "white" } : {}}
    >
      {isCameraActive ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          style={{ fill: "black" }}
        >
          <path
            fillRule="evenodd"
            d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"
          ></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path
            fillRule="evenodd"
            d="M10.961 12.365a2 2 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518zM1.428 4.18A1 1 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634zM15 11.73l-3.5-1.555v-4.35L15 4.269zm-4.407 3.56-10-14 .814-.58 10 14z"
          ></path>
        </svg>
      )}
    </button>
  );
};

export default CameraButton;
