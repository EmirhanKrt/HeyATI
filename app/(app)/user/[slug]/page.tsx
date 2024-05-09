import NavigationPanel from "@/components/NavigationPanel";

import { AppPanel } from "@/components/AppPanel";
import { DetailsPanel } from "@/components/DetailsPanel";
import { AppHeader } from "@/components/AppHeader";
import UserPrivateMessagePanel from "./UserPrivateMessagePanel";

const UserPrivateMessagePage = ({ params }: { params: { slug: string } }) => {
  return (
    <>
      <AppHeader pageTitle="Private Message" />
      <section className="panel-container">
        <NavigationPanel type={"user"} activeUserName={params.slug} />
        <AppPanel>
          <>
            <UserPrivateMessagePanel user_name={params.slug} />
          </>
        </AppPanel>
        <DetailsPanel>
          <></>
        </DetailsPanel>
      </section>
    </>
  );
};

export default UserPrivateMessagePage;
