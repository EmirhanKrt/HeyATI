"use client";

import { selectColor } from "@/lib/generateBackgroundColorByUserName";

const Avatar = ({
  user,
}: {
  user: {
    user_id: number;
    user_name: string;
    first_name: string;
    last_name: string;
  };
}) => {
  return (
    <span
      className="avatar"
      style={{ backgroundColor: selectColor(user.user_name) }}
    >
      {user.first_name[0].toUpperCase()}
      {user.last_name[0].toUpperCase()}
    </span>
  );
};

export default Avatar;
