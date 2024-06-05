import { AppContentContainer } from "./AppContentContainer";
import { AppContentHeader } from "./AppContentHeader";

export const AppContentPanel = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="app-panel-container">{children}</div>;
};

AppContentPanel.Header = AppContentHeader;
AppContentPanel.Container = AppContentContainer;
