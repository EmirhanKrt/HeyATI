import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { api } from "../api";
import {
  addServer,
  initialServerDetailedData,
} from "../store/features/server/serverSlice";

const useServerDetails = (server_id: number) => {
  const dispatch = useAppDispatch();

  const targetServer = useAppSelector((state) => state.server)[server_id];

  useEffect(() => {
    const getServerDetails = async () => {
      const { data: serverDetails } = await api.server({ server_id }).get();

      if (serverDetails) {
        dispatch(addServer(serverDetails.data.server));
      } else {
        dispatch(addServer(initialServerDetailedData(server_id)));
      }
    };

    getServerDetails();
  }, [dispatch, server_id]);
};

export default useServerDetails;
