"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setActiveCameraDeviceId,
  toggleCamera,
} from "@/lib/store/features/mediaPreferences/mediaPreferencesSlice";
import { useEffect, useRef, useState } from "react";

const CameraButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isFullScreen = useAppSelector((state) => state.videoChat.isFullScreen);

  const { isCameraActive, devices, activeCameraDeviceId } = useAppSelector(
    (state) => state.mediaPreferences
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;

      if (menuRef.current.contains(event.target as Node)) return;

      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  return (
    <div style={{ display: "flex", position: "relative" }}>
      <button
        className="icon-button"
        onClick={() => dispatch(toggleCamera())}
        style={
          isCameraActive
            ? {
                background: "white",
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }
            : { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
        }
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

      {isFullScreen && (
        <>
          <div
            onClick={toggleDropdown}
            style={{
              width: "24px",
              height: "56px",
              backgroundColor: "var(--background-color-5)",
              color: "var(--title-color)",
              display: "flex",
              alignItems: "center",
              borderRadius: 5,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              cursor: "pointer",
            }}
          >
            {isOpen ? (
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0V0z"></path>
                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
              </svg>
            ) : (
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0V0z"></path>
                <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path>
              </svg>
            )}
          </div>
          {isOpen && (
            <div
              style={{
                border: "1px solid #000",
                width: "270px",
                bottom: 64,
                position: "absolute",
                backgroundColor: "var(--background-color-5)",
              }}
              ref={menuRef}
            >
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {devices
                  .filter((device) => device.kind === "videoinput")
                  .map((device) => {
                    return (
                      <li
                        key={device.deviceId}
                        style={
                          activeCameraDeviceId === device.deviceId
                            ? {
                                backgroundColor: "var(--primary-color)",
                                padding: "10px",
                                fontWeight: 500,
                                color: "black",
                                cursor: "pointer",
                              }
                            : {
                                padding: "10px",
                                cursor: "pointer",
                                color: "var(--title-color)",
                              }
                        }
                        onClick={() => {
                          dispatch(setActiveCameraDeviceId(device.deviceId));
                        }}
                      >
                        {device.label}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraButton;
