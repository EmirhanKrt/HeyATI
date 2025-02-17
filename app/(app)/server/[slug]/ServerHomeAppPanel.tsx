"use client";

import ServerDashboardCalendar from "@/components/Calendar/ServerDashboardCalendar";
import { LoadingCircle } from "@/components/LoadingCircle";
import { ServerDetailedDataType } from "@/server/models";

const ServerHomeAppPanel = ({
  isServerFound,
  isLoading,
  targetServer,
}: {
  isServerFound: boolean;
  isLoading: boolean;
  targetServer: ServerDetailedDataType;
}) => {
  if (isLoading) {
    return <LoadingCircle />;
  }

  let container;

  if (!isServerFound) {
    container = (
      <span className="error-background error-text" style={{ margin: 12 }}>
        Server not found!
      </span>
    );
  } else {
    container = (
      <div style={{ padding: 12 }}>
        <h4>{targetServer.server_name}</h4>
        {targetServer.server_description !== "" && (
          <p>{targetServer.server_description}</p>
        )}
        <ServerDashboardCalendar server={targetServer}/>
      </div>
    );
  }

  return (
    <div
      style={{
        justifyContent: "flex-start",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        gap: 16,
      }}
    >
      {container}
    </div>
  );
};

export default ServerHomeAppPanel;
