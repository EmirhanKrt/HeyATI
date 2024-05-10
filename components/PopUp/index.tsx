"use client";

import { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from "react";

type ContentPopupPropsType = {
  type: "content";
};

type MediaPopupPropsType = {
  type: "media";
};

type PopUpPropsType = {
  title: string;
  children: ReactNode;
  openState: boolean;
  setOpenState: Dispatch<SetStateAction<boolean>>;
} & (ContentPopupPropsType | MediaPopupPropsType);

const PopUp = (props: PopUpPropsType) => {
  const onClose = () => props.setOpenState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!overlayRef.current) return;

      if (overlayRef.current.contains(event.target as Node)) return;

      onClose();
    };

    if (props.openState) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [props.openState]);

  if (!props.openState)
    return (
      <div
        className="overlay"
        style={{ opacity: 0, visibility: "hidden" }}
      ></div>
    );

  if (props.type === "content")
    return (
      <div className="overlay">
        <div className="popup" ref={overlayRef}>
          <div className="popup-header">
            <h4>{props.title}</h4>
            <button
              onClick={onClose}
              style={{
                width: "25px",
                height: "25px",
                borderRadius: "50%",
                padding: 0,
              }}
            >
              &times;
            </button>
          </div>
          <div>{props.children}</div>
        </div>
      </div>
    );

  return (
    <div className="overlay">
      <div
        className="popup media-growed"
        ref={overlayRef}
        style={{
          height: "70%",
          maxHeight: "70%",
          minHeight: "70%",
          width: "fit-content",
          maxWidth: "unset",
          minWidth: "unset",
          padding: "0",
          display: "flex",
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default PopUp;
