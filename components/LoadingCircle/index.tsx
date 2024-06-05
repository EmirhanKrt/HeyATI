export const LoadingCircle = ({
  width = 50,
  height = 50,
  isPrimary = true,
}: {
  width?: number;
  height?: number;
  isPrimary?: boolean;
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "inherit",
        height: "100%",
        color: "var(--title-color)",
      }}
    >
      <svg
        className="spinner"
        viewBox="0 0 50 50"
        width={width}
        height={height}
      >
        <circle
          className={`path ${isPrimary ? "primary" : ""}`}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
        ></circle>
      </svg>
    </div>
  );
};
