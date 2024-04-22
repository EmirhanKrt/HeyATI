export type ValidationErrorPayload = {
  path: string;
  message: string;
};

export type ValidationErrorData = {
  field: string;
  message: string;
};

export type BodyValidationErrorResponseData = {
  body: ValidationErrorData[];
};

export type ParamsValidationErrorResponseData = {
  params: ValidationErrorData[];
};

export type ValidationErrorResponseData =
  | BodyValidationErrorResponseData
  | ParamsValidationErrorResponseData;
