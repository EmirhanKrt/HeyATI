import DashboardSubNavigationPanel from "./DashboardSubNavigationPanel";
import ServerSubNavigationPanel from "./ServerSubNavigationPanel";

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
  isLoading: boolean;
  isServerFound: boolean;
};

type ChannelPropType = {
  type: "channel";
  activeServerId: number;
  activeChannelId: number;
  isLoading: boolean;
  isServerFound: boolean;
};

type PropType =
  | DashboardPropType
  | UserPrivateMessagePropType
  | ServerPropType
  | ChannelPropType;

const NavigationPanel = (props: PropType) => {
  let activeServerId: number | undefined = undefined;
  let activeChannelId: number | undefined = undefined;

  const generateSubNavigationPanel = () => {
    switch (props.type) {
      case "dashboard":
        return <DashboardSubNavigationPanel />;

      case "user":
        return (
          <DashboardSubNavigationPanel
            active_user_name={props.active_user_name}
          />
        );

      case "server":
        activeServerId = props.activeServerId;
        return (
          <ServerSubNavigationPanel
            activeServerId={activeServerId}
            isLoading={props.isLoading}
            isServerFound={props.isServerFound}
            style={
              props.isLoading
                ? {
                    backgroundColor: "var(--background-color)",
                  }
                : { backgroundColor: "var(--background-color-2)" }
            }
          />
        );

      case "channel":
        activeServerId = props.activeServerId;
        activeChannelId = props.activeChannelId;
        return (
          <ServerSubNavigationPanel
            activeServerId={activeServerId}
            activeChannelId={activeChannelId}
            isLoading={props.isLoading}
            isServerFound={props.isServerFound}
            style={
              props.isLoading
                ? {
                    backgroundColor: "var(--background-color)",
                  }
                : { backgroundColor: "var(--background-color-2)" }
            }
          />
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
