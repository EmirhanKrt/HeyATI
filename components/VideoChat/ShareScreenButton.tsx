"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toggleScreenShare } from "@/lib/store/features/mediaPreferences/mediaPreferencesSlice";

const ScreenShareButton = () => {
  const isScreenSharingActive = useAppSelector(
    (state) => state.mediaPreferences.isScreenSharingActive
  );
  const dispatch = useAppDispatch();

  return (
    <button
      className="icon-button"
      onClick={() => dispatch(toggleScreenShare())}
      style={isScreenSharingActive ? { background: "white" } : {}}
    >
      {isScreenSharingActive ? (
        <svg
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          style={{ stroke: "black", fill: "none" }}
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
          style={{ stroke: "currentcolor", fill: "none" }}
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
  );
};

export default ScreenShareButton;
