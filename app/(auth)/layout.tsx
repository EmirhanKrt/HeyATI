import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

import styles from "./page.module.css";

const getUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (token) {
    const fetchUserRequest = await api.user.me.get({
      headers: { cookie: "token=" + token.value },
    });

    if (!fetchUserRequest.error) {
      redirect("/");
    }
  }
};

const AuthLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  await getUser();

  return <main className={styles.main}>{children}</main>;
};

export default AuthLayout;
