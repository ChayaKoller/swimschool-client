export type ApiErrorParams = {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  traceId?: string;
};
export class ApiError extends Error {
  name = "ApiError";
  status: number;
  code: string;
  fieldErrors: Record<string, string[]>;
  traceId: string | undefined;

  constructor({
  status,
  code,
  message,
  fieldErrors = {},
  traceId
}: ApiErrorParams) {
  super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.traceId = traceId;
  }
}
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "משהו השתבש, נסי שוב";
}
export const NETWORK_ERROR = new ApiError({
  status: 0,
  code: "NETWORK_ERROR",
  message: "אין חיבור לשרת. בדקי את החיבור ונסי שוב"
});
export function isGlobalError(status: number) {
  return status === 0 || status === 403 || status === 429 || status >= 500;
}
export function isNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}
export function hasErrorCode(error: unknown, code: string) {
  return error instanceof ApiError && error.code === code;
}
