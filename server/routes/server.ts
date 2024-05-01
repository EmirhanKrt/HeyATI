import Elysia from "elysia";
import { serverTable } from "@/server/db/schema";
import { ServerUpdatePayloadType, serverModel } from "@/server/models";
import { ContextWithUser } from "@/server/types";
import { ServerService } from "@/server/services";
import { BodyValidationError, ForbiddenError } from "@/server/errors";
import { userAccessPlugin } from "@/server/plugins";

export const serverRoutes = new Elysia({
  name: "server-routes",
  prefix: "/server",
})
  .use(serverModel)
  .post(
    "/",
    async (context) => {
      const contextWithUser = context as ContextWithUser;

      const server = await ServerService.insertOneServer({
        server_name: context.body.server_name,
        server_description: context.body.server_description,
        owner_id: contextWithUser.user.user_id,
      });

      return {
        success: true,
        message: "Created server succefully.",
        data: {
          server: ServerService.toSafeServerType(server!),
        },
      };
    },
    {
      body: "server.post.index.request.body",
      response: "server.post.index.response.body",
    }
  )
  .use(userAccessPlugin)
  .guard(
    {
      params: "server.server_id.request.params",
      response: "server.server_id.response.body",
    },
    (app) =>
      app
        .get(`/:${serverTable.server_id.name}`, ({ server }) => {
          return {
            success: true,
            message: "Retrived server succefully.",
            data: {
              server: ServerService.toSafeServerType(server),
            },
          };
        })
        .put(
          `/:${serverTable.server_id.name}`,
          async ({ body, server }) => {
            if (!Object.keys(body).length)
              throw new BodyValidationError(
                [
                  { path: "server_description", message: "Invalid value." },
                  { path: "server_name", message: "Invalid value." },
                  { path: "owner_id", message: "Invalid value." },
                ],
                "For update the server details, server_description or server name or owner id must be provided."
              );

            const updatePayload = {
              ...body,
            } as ServerUpdatePayloadType;

            if (updatePayload.owner_id) {
              const isNewOwnerJoinedServer =
                await ServerService.getServerUserByServerAndUserId(
                  updatePayload.owner_id,
                  server.server_id
                );

              if (!isNewOwnerJoinedServer)
                throw new BodyValidationError(
                  [{ path: "owner_id", message: "Invalid value." }],
                  "New owner must beening the server."
                );
            }

            const updatedServer = await ServerService.updateServer(
              updatePayload,
              server.server_id
            );

            return {
              success: true,
              message: "Updated server succefully.",
              data: {
                server: ServerService.toSafeServerType(updatedServer),
              },
            };
          },
          {
            body: "server.put.server_id.request.body",
          }
        )
        .delete(`/:${serverTable.server_id.name}`, async ({ server }) => {
          const deletedServer = await ServerService.deleteServer(
            server.server_id
          );

          return {
            success: true,
            message: "Deleted server successfully.",
            data: {
              server: ServerService.toSafeServerType(deletedServer),
            },
          };
        })
  );
