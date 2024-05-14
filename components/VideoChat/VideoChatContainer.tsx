"use client";

import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  toggleCamera,
  toggleMicrophone,
  toggleScreenShare,
} from "@/lib/store/features/videoChat/videoChatSlice";

const VideoChatContainer = ({ children }: { children: React.ReactNode }) => {
  const videoChat = useAppSelector((state) => state.videoChat);
  const dispatch = useAppDispatch();

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(true);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isFullscreen && videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDragging && videoContainerRef.current) {
      const newLeft = e.clientX - offset.x;
      const newTop = e.clientY - offset.y;
      const containerWidth = videoContainerRef.current.offsetWidth;
      const containerHeight = videoContainerRef.current.offsetHeight;
      const maxLeft = window.innerWidth - containerWidth;
      const maxTop = window.innerHeight - containerHeight;

      if (newLeft >= 0 && newLeft <= maxLeft) {
        videoContainerRef.current.style.left = `${newLeft}px`;
      }
      if (newTop >= 0 && newTop <= maxTop) {
        videoContainerRef.current.style.top = `${newTop}px`;
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="video-chat-container">
      <div>
        {children}
        <div className="video-action-button-container">
          <button
            className="icon-button"
            onClick={() => dispatch(toggleMicrophone())}
          >
            {videoChat.isMicrophoneActive ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
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
          <button
            className="icon-button"
            onClick={() => dispatch(toggleCamera())}
          >
            {videoChat.isCameraActive ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
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
          <button
            className="icon-button"
            onClick={() => dispatch(toggleScreenShare())}
          >
            {videoChat.isScreenSharingActive ? (
              <svg
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9"></path>
                <path d="M7 20l10 0"></path>
                <path d="M9 16l0 4"></path>
                <path d="M15 16l0 4"></path>
                <path d="M17 8l4 -4m-4 0l4 4"></path>
              </svg>
            ) : (
              <svg
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9"></path>
                <path d="M7 20l10 0"></path>
                <path d="M9 16l0 4"></path>
                <path d="M15 16l0 4"></path>
                <path d="M17 4h4v4"></path>
                <path d="M16 9l5 -5"></path>
              </svg>
            )}
          </button>
          <button className="icon-button leave-button">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.68 16.07l3.92-3.11V9.59c2.85-.93 5.94-.93 8.8 0v3.38l3.91 3.1L24 12.39c-6.41-7.19-17.59-7.19-24 0l3.68 3.68z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChatContainer;
