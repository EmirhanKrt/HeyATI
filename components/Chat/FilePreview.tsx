"use client";

import { MouseEventHandler, useEffect, useMemo, useState } from "react";
import PopUp from "../PopUp";
import styles from "./component.module.css";

type FileReviewPropsType = {
  file: File;
  index: number;
  onRemove: MouseEventHandler<SVGSVGElement>;
};

export const FilePreview = (props: FileReviewPropsType) => {
  const [isMediaGrowed, setIsMediaGrowed] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");

  const { file, onRemove } = props;

  const isImage =
    file.type.startsWith("image") && file.type !== "image/svg+xml";

  const isVideo = file.type.startsWith("video");

  useEffect(() => {
    const mediaUrl = URL.createObjectURL(file);
    setFilePreviewUrl(mediaUrl);

    return () => {
      URL.revokeObjectURL(mediaUrl);
    };
  }, [file]);

  const filePreview = useMemo(() => {
    const commonProps = {
      src: filePreviewUrl,
      alt: file.name,
      onClick: (event: any) => setIsMediaGrowed(true),
    };

    if (isImage) {
      return <img {...commonProps} />;
    } else if (isVideo) {
      commonProps.onClick = (event) => {
        event.preventDefault();
        setIsMediaGrowed(true);
      };

      return (
        <video className={styles.preview_video} controls {...commonProps}>
          <source src={filePreviewUrl} type={file.type} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 80"
        width={"100%"}
        height={"80px"}
        fill="none"
      >
        <g clipPath="url(#clip0_38_41)">
          <path
            d="M0 8C0 3.58172 3.58172 0 8 0H34L60 26V72C60 76.4183 56.4183 80 52 80H8C3.58172 80 0 76.4183 0 72V8Z"
            fill="#FF783A"
          />
          <path
            d="M40 26H60L34 0V20C34 23.3137 36.6863 26 40 26Z"
            fill="white"
            fillOpacity="0.5"
          />
        </g>
        <defs>
          <clipPath id="clip0_38_41">
            <rect width="60" height="80" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  }, [isMediaGrowed, filePreviewUrl]);

  return (
    <div className={styles.chat_file_preview_item}>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}
      >
        <span>{file.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id={"remove_" + props.index.toString()}
          viewBox="0 0 448 512"
          height={17.5}
          width={17.5}
          fill="currentColor"
          style={{ cursor: "pointer" }}
          onClick={onRemove}
        >
          <path d="m432 32h-120l-9.4-18.7a24 24 0 0 0 -21.5-13.3h-114.3a23.72 23.72 0 0 0 -21.4 13.3l-9.4 18.7h-120a16 16 0 0 0 -16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0 -16-16zm-378.8 435a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45l21.2-339h-384z" />
        </svg>
      </div>
      {filePreview}

      <PopUp
        type="media"
        title={isImage ? "image" : "video"}
        openState={isMediaGrowed}
        setOpenState={setIsMediaGrowed}
      >
        {filePreview}
      </PopUp>
    </div>
  );
};
