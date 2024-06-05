"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setActiveMicrophoneDeviceId,
  toggleMicrophone,
} from "@/lib/store/features/mediaPreferences/mediaPreferencesSlice";
import { useEffect, useRef, useState } from "react";

const MicrophoneButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isFullScreen = useAppSelector((state) => state.videoChat.isFullScreen);

  const { isMicrophoneActive, devices, activeMicrophoneDeviceId } =
    useAppSelector((state) => state.mediaPreferences);

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

  let buttonStyle = isFullScreen
    ? {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }
    : {
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
      };

  return (
    <div style={{ marginLeft: "auto", display: "flex", position: "relative" }}>
      <button
        className="icon-button"
        onClick={() => dispatch(toggleMicrophone())}
        style={
          isMicrophoneActive
            ? {
                background: "white",
                ...buttonStyle,
              }
            : {
                ...buttonStyle,
              }
        }
      >
        {isMicrophoneActive ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            style={{ fill: "black" }}
          >
            <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"></path>
            <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4 4 0 0 0 12 8V7a.5.5 0 0 1 1 0zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a5 5 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4m3-9v4.879l-1-1V3a2 2 0 0 0-3.997-.118l-.845-.845A3.001 3.001 0 0 1 11 3"></path>
            <path d="m9.486 10.607-.748-.748A2 2 0 0 1 6 8v-.878l-1-1V8a3 3 0 0 0 4.486 2.607m-7.84-9.253 12 12 .708-.708-12-12z"></path>
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
                  .filter((device) => device.kind === "audioinput")
                  .map((device) => {
                    return (
                      <li
                        key={device.deviceId}
                        style={
                          activeMicrophoneDeviceId === device.deviceId
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
                          dispatch(
                            setActiveMicrophoneDeviceId(device.deviceId)
                          );
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

export default MicrophoneButton;
