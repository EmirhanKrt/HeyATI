import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { setMessagesByChannelId } from "../store/features/server/serverSlice";

const useChannelMessages = (server_id: number, channel_id: number) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const getChannelMessages = async () => {
      try {
        const request = await fetch(
          `/api/server/${server_id}/channel/${channel_id}/messages`,
          {
            method: "GET",
          }
        ).then((data) => data.json());

        if (request.success) {
          dispatch(
            setMessagesByChannelId({
              server_id: server_id,
              channel_id: channel_id,
              messages: request.data.message,
            })
          );
        } else {
        }
      } catch (error) {
        console.error("Error occured on uploading file. Error:", error);
      }
    };

    getChannelMessages();
  }, [dispatch, server_id, channel_id]);
};

export default useChannelMessages;
