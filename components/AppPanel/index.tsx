export const AppPanel = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="app-panel">{children}</div>;
};
