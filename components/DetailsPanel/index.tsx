export const DetailsPanel = ({
  style,
  children,
}: Readonly<{
  style?: React.CSSProperties;
  children: React.ReactNode;
}>) => {
  return (
    <div className="panel details-panel" style={style}>
      {children}
    </div>
  );
};
