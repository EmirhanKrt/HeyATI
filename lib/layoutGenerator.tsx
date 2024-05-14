import { ReactNode } from "react";
import { Archivo } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import StoreProvider from "./store/StoreProvider";

import VideoChatWrapper from "@/components/VideoChat/VideoChatWrapper";

import "@/app/globals.css";

const archivio = Archivo({ subsets: ["latin"] });

interface LayoutProps {
  children: React.ReactNode;
}

interface LayoutOptions {
  type: "App" | "Auth";
}

const getUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) return null;

  return api.user.me.get({
    headers: { cookie: "token=" + token.value, cache: "no-cache" },
  });
};

const createLayout = ({ type }: LayoutOptions) => {
  const LayoutComponent: React.FC<LayoutProps> = async ({ children }) => {
    const fetchUserRequest = await getUser();

    let storeProviderWrapper: ReactNode = children;

    switch (type) {
      case "App":
        if (!fetchUserRequest || fetchUserRequest.error) {
          redirect("/login");
        }

        storeProviderWrapper = (
          <StoreProvider
            user={fetchUserRequest.data.data.user}
            server={fetchUserRequest.data.data.server}
            interactedUsers={fetchUserRequest.data.data.interactedUsers}
          >
            <main>
              {children}
              <VideoChatWrapper />
            </main>
          </StoreProvider>
        );

        break;

      case "Auth":
        if (fetchUserRequest && !fetchUserRequest.error) {
          redirect("/");
        }

        break;

      default:
        break;
    }

    return (
      <html lang="en">
        <body className={archivio.className}>{storeProviderWrapper}</body>
      </html>
    );
  };

  return LayoutComponent;
};

export default createLayout;
