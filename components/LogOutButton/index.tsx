"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const LogOutButton = () => {
  const router = useRouter();

  const onClick = async () => {
    const logOutRequest = await api.auth.logout.post();

    if (!logOutRequest.error) {
      router.replace("/login");
    }
  };
  return (
    <button className="primary" onClick={onClick}>
      logout
    </button>
  );
};

export default LogOutButton;
