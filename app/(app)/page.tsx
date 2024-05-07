import NavigationPanel from "@/components/NavigationPanel";

import { AppPanel } from "@/components/AppPanel";
import { DetailsPanel } from "@/components/DetailsPanel";
import { AppHeader } from "@/components/AppHeader";

const Dashboard = () => {
  return (
    <>
      <AppHeader pageTitle="Dashboard" />
      <section className="panel-container">
        <NavigationPanel type="dashboard" />
        <AppPanel>
          <>Calendar will be rendered here</>
        </AppPanel>
        <DetailsPanel>
          <></>
        </DetailsPanel>
      </section>
    </>
  );
};

export default Dashboard;
