"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { initializeUser } from "./features/user/userSlice";
import { initializeServer } from "./features/server/serverSlice";
import { SafeServerType, SafeUserType } from "@/server/models";
import { initializeInteractedUsers } from "./features/interactedUsers/interactedUsersSlice";

export default function StoreProvider({
  children,
  user,
  server = [],
  interactedUsers = [],
}: {
  children: React.ReactNode;
  user: SafeUserType;
  server?: SafeServerType[];
  interactedUsers?: SafeUserType[];
}) {
  const storeRef = useRef<AppStore>();

  if (!storeRef.current) {
    storeRef.current = makeStore();
    storeRef.current.dispatch(initializeUser(user));
    storeRef.current.dispatch(initializeServer(server));
    storeRef.current.dispatch(initializeInteractedUsers(interactedUsers));
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
