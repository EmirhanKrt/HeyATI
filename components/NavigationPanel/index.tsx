import ServerNavigationPanel from "./ServerNavigationPanel";
import DashboardSubNavigationPanel from "./DashboardSubNavigationPanel";

type DashboardPropType = {
  type: "dashboard";
};

type UserPrivateMessagePropType = {
  type: "user";
  active_user_name: string;
};

type ServerPropType = {
  type: "server";
  activeServerId: number;
};

type PropType = DashboardPropType | UserPrivateMessagePropType | ServerPropType;

const NavigationPanel = (props: PropType) => {
  let activeServerId: number | undefined = undefined;

  const generateSubNavigationPanel = () => {
    switch (props.type) {
      case "dashboard":
        return (
          <>
            <ServerNavigationPanel />
            <DashboardSubNavigationPanel />
          </>
        );

      case "user":
        return (
          <>
            <ServerNavigationPanel />
            <DashboardSubNavigationPanel
              active_user_name={props.active_user_name}
            />
          </>
        );

      case "server":
        activeServerId = props.activeServerId;
        return (
          <>
            <ServerNavigationPanel activeServerId={activeServerId} />
          </>
        );

      default:
        return <></>;
    }
  };

  return (
    <div className="panel navigation-panel">{generateSubNavigationPanel()}</div>
  );
};

export default NavigationPanel;
