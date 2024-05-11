import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addInteractedUser,
  clearNotInteractedUsers,
  setMessagesByUserName,
} from "../store/features/interactedUsers/interactedUsersSlice";
import { api } from "../api";

const useUserDetails = (user_name: string) => {
  const dispatch = useAppDispatch();

  const targetUser = useAppSelector(
    (state) => state.interactedUsers.users[user_name]
  );

  useEffect(() => {
    dispatch(clearNotInteractedUsers());

    const getUserDetails = async () => {
      if (!targetUser) {
        const { data: userDetails } = await api
          .user({ user_name: user_name })
          .get();

        if (userDetails) {
          dispatch(addInteractedUser(userDetails.data.user));
        } else {
          dispatch(
            addInteractedUser({
              user_id: 0,
              user_name: user_name,
              user_email: "john_doe@mail.com",
              first_name: "John",
              last_name: "Doe",
              created_at: new Date().toISOString(),
            })
          );
        }
      }

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
