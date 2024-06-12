"use client";

import { LoadingCircle } from "@/components/LoadingCircle";
import PopUp from "@/components/PopUp";
import { SafeInviteType } from "@/server/models/invite";
import axios from "axios";
import { useEffect, useState } from "react";
import ServerInviteDeleteForm from "./ServerInviteDeleteForm";
import ServerInviteCreateForm from "./ServerInviteCreateForm";

const Invite = ({
  invite,
  owner,
}: {
  invite: SafeInviteType;
  owner:
    | {
        user_id: number;
        user_name: string;
        first_name: string;
        last_name: string;
        role: string;
      }
    | undefined;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "var(--background-color-3)",
        borderRadius: 8,
        padding: "20px",
        display: "flex",
        gap: "10px",
        flexDirection: "column",
      }}
    >
      <h4>Invite by {owner ? "@" + owner.user_name : "unknown user"}</h4>
      <div>
        <p>Invite Code: {invite.server_invite_code}</p>
        <p>
          Used {invite.total_use_count}/{invite.max_use_count} times
        </p>
        <p>Valid until: {invite.due_date}</p>
      </div>
      <button
        className="primary"
        type="submit"
        onClick={() => setIsOpen(true)}
        style={{
          background: "var(--error-background-color)",
        }}
      >
        Delete
      </button>

      <PopUp
        type="content"
        title="Invites"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <ServerInviteDeleteForm
          server_id={invite.server_id}
          invite_id={invite.server_invite_code_id}
        />
      </PopUp>
    </div>
  );
};

const CreateInviteButton = ({ server_id }: { server_id: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="primary" onClick={() => setIsOpen(true)}>
        Create Server Invite Code
      </button>

      <PopUp
        type="content"
        title="Invite"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        <ServerInviteCreateForm server_id={server_id} />
      </PopUp>
    </>
  );
};

const Invites = ({
  server_id,
  serverUsers,
}: {
  server_id: number;
  serverUsers: {
    user_id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    role: string;
  }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [invites, setInvites] = useState<SafeInviteType[]>([]);

  useEffect(() => {
    const getInvites = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `/api/server/${server_id.toString()}/invite`
        );

        setInvites(data.data.invites);
      } catch (error) {
        setInvites([]);
      }

      setIsLoading(false);
    };

    if (isOpen) getInvites();

    return () => {};
  }, [server_id, isOpen]);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        style={{
          color: "inherit",
          fontSize: "inherit",
          width: "100%",
          height: "100%",
          lineHeight: "42px",
        }}
      >
        Invites
      </div>
      <PopUp
        type="content"
        title="Invites"
        openState={isOpen}
        setOpenState={setIsOpen}
      >
        {isLoading ? (
          <div style={{ paddingTop: 20 }}>
            <LoadingCircle />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: 20,
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxHeight: "40vh",
                overflow: "auto",
              }}
            >
              {invites.map((invite) => {
                return (
                  <Invite
                    invite={invite}
                    key={invite.server_invite_code_id}
                    owner={serverUsers.find(
                      (owner) => owner.user_id === invite.owner_id
                    )}
                  />
                );
              })}
            </div>
            <CreateInviteButton server_id={server_id} />
          </div>
        )}
      </PopUp>
    </>
  );
};

export default Invites;
