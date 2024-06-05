export const AppContentContainer = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="app-panel-content-container">{children}</div>;
};
