import { TSchema, t } from "elysia";

export const generateSuccessReponseBodySchema = (dataSchema: TSchema) => {
  const success = t.Literal(true);
  const message = t.String({ default: null });
  const data = dataSchema;

  return t.Object({
    success,
    message,
    data,
  });
};
