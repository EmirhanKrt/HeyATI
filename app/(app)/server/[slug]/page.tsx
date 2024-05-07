import NavigationPanel from "@/components/NavigationPanel";

import { AppPanel } from "@/components/AppPanel";
import { DetailsPanel } from "@/components/DetailsPanel";
import { AppHeader } from "@/components/AppHeader";

const ServerPage = ({ params }: { params: { slug: number } }) => {
  return (
    <>
      <AppHeader pageTitle="Server" />
      <section className="panel-container">
        <NavigationPanel type={"server"} activeServerId={params.slug} />
        <AppPanel>
          <>{params.slug}</>
        </AppPanel>
        <DetailsPanel>
          <></>
        </DetailsPanel>
      </section>
    </>
  );
};

export default ServerPage;
