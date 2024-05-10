import type { Metadata } from "next";
import createLayout from "@/lib/layoutGenerator";

export const metadata: Metadata = {
  title: "Hey ATI - Auth",
  description: "Hey ATI Application",
};

const AuthLayout = createLayout({ type: "Auth" });

export default AuthLayout;
