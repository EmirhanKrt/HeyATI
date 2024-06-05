import Elysia, { t } from "elysia";
import { Stream } from "@elysiajs/stream";
import OpenAI from "openai";
import { BodyValidationError } from "../errors";

export const aiRoutes = new Elysia({ name: "ai-routes", prefix: "/ai" })
  .decorate(() => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    return { openai };
  })
  .post(
    "",
    (context) => {
      const messageNotWanted = context.body.messages.find(
        (message) => !["assistant", "user"].includes(message.role)
      );

      if (messageNotWanted)
        throw new BodyValidationError(
          [{ path: "role", message: "Invalid value." }],
          "Role must be user or assistant."
        );

      return new Stream(
        context.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          stream: true,
          messages: context.body
            .messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        })
      );
    },
    {
      body: t.Object({
        messages: t.Array(t.Object({ role: t.String(), content: t.String() })),
      }),
    }
  );
