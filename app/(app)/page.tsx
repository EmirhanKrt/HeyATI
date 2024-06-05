import NavigationPanel from "@/components/NavigationPanel";

import { AppPanel } from "@/components/AppPanel";
import ServerNavigationPanel from "@/components/NavigationPanel/ServerNavigationPanel";
import { AppContentPanel } from "@/components/AppContentPanel";

const Dashboard = () => {
  return (
    <>
      <ServerNavigationPanel />
      <section className="panel-container">
        <NavigationPanel type="dashboard" />

        <AppContentPanel>
          <AppContentPanel.Header>Dashboard</AppContentPanel.Header>
          <AppContentPanel.Container>
            <AppPanel>
              <>Calendar will be rendered here</>
            </AppPanel>
          </AppContentPanel.Container>
        </AppContentPanel>
      </section>
    </>
  );
};

export default Dashboard;
