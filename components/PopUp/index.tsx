import { Dispatch, ReactNode, SetStateAction } from "react";

const PopUp = ({
  title,
  children,
  openState,
  setOpenState,
}: {
  title: string;
  children: ReactNode;
  openState: boolean;
  setOpenState: Dispatch<SetStateAction<boolean>>;
}) => {
  const onClose = () => setOpenState(false);

  if (openState)
    return (
      <div className="overlay">
        <div className="popup">
          <div className="popup-header">
            <h4>{title}</h4>
            <button
              onClick={onClose}
              style={{
                width: "25px",
                height: "25px",
                borderRadius: "50%",
                padding: 0,
              }}
            >
              &times;
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    );

  return (
    <div className="overlay" style={{ opacity: 0, visibility: "hidden" }}></div>
  );
};

export default PopUp;
