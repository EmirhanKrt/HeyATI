"use client";

import { FormEventHandler, useState } from "react";

const FileUploadComponent = () => {
  const [userName, setUserName] = useState<string | null>();

  const handleUpload: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const body = new FormData(event.currentTarget);

    const fileInput = event.currentTarget.elements.namedItem(
      "files"
    ) as HTMLInputElement;

    if (fileInput && fileInput.files && fileInput.files.length === 0) {
      body.delete("files");
    }

    try {
      const request = await fetch(`/api/user/${userName}/message`, {
        method: "POST",
        body,
      }).then((data) => data.json());
    } catch (error) {
      console.error("Error occured on uploading file. Error:", error);
    }
  };

  return (
    <div>
      UserName:
      <input
        type="text"
        onChange={(event) => setUserName(event.target.value)}
      />
      <form onSubmit={handleUpload}>
        Message:
        <input
          id="private_message_content"
          name="private_message_content"
          type="text"
          required
        />
        File(s):
        <input
          id="file"
          name="files"
          type="file"
          multiple
          accept="video/*, application/*, image/*"
        />
        <button type="submit">Send message</button>
      </form>
    </div>
  );
};

export default FileUploadComponent;
