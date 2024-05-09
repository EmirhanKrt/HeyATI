import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { setMessagesByUserName } from "../store/features/interactedUsers/interactedUsersSlice";
import { api } from "../api";

const useUserDetails = (user_name: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const getUserDetails = async () => {
      const { data } = await api.user({ user_name: user_name }).messages.get();
      if (!data) return;

      dispatch(
        setMessagesByUserName({
          user_name: user_name,
          messages: data.data.message,
        })
      );
    };

    getUserDetails();
  }, [dispatch, user_name]);
};

export default useUserDetails;
