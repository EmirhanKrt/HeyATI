export const AppPanel = ({
  style,
  children,
}: Readonly<{
  style?: React.CSSProperties;
  children: React.ReactNode;
}>) => {
  return (
    <div className="panel app-panel" style={style}>
      {children}
    </div>
  );
};
