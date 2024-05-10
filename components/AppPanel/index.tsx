export const AppPanel = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="panel app-panel">{children}</div>;
};
