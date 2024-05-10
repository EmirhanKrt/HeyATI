import type { Metadata } from "next";
import createLayout from "@/lib/layoutGenerator";

import "./app.global.css";

export const metadata: Metadata = {
  title: "Hey ATI - App",
  description: "Hey ATI Application",
};

const AppLayout = createLayout({ type: "App" });

export default AppLayout;
