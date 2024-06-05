export const AppContentHeader = ({
  style,
  children,
}: Readonly<{
  style?: React.CSSProperties;
  children: React.ReactNode;
}>) => {
  return (
    <div className="app-panel-header" style={style}>
      {children}
    </div>
  );
};
