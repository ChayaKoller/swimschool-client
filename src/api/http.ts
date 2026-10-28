import axios from "axios";
import { getToken } from "./tokenStorage";
import { ApiError, NETWORK_ERROR } from "./apiError";


let unauthorizedHandler: (() => void) | null = null;

export const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api`,
});

// הוספת Token לכל בקשה
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function readErrorData(data: unknown) {
  if (!(data instanceof Blob)) return data;
  try {
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}

// טיפול בשגיאות
http.interceptors.response.use(
  (response) => response,
  async(error: unknown) => {
    // שגיאה שלא מ-axios = באג בקוד, מעבירים הלאה כמו שהיא
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const { response, config } = error;

    // השרת לא ענה בכלל
    if (!response) {
      return Promise.reject(NETWORK_ERROR);
    }

    // החיבור פג (חוץ מהכניסה עצמה, שם מציגים את ההודעה בטופס)
    if (response.status === 401 && !config?.url?.includes("/auth/login")) {
      unauthorizedHandler?.();
    }

    const data = await readErrorData(response.data);
    const isServerError =
      typeof data?.code === "string" && typeof data?.message === "string";

    // תשובה שלא בצורה של השרת (למשל 502 מ-Render)
    if (!isServerError) {
      return Promise.reject(
        new ApiError({
          status: response.status,
          code: "UNKNOWN",
          message: "אירעה שגיאה בשרת, נסי שוב",
        })
      );
    }

    return Promise.reject(
      new ApiError({
        status: response.status,
        code: data.code,
        message: data.message,
        fieldErrors: data.errors ?? {},
        traceId: data.traceId ?? undefined,
      })
    );
  }
);

export function setUnauthorizedHandler(
  handler: (() => void) | null
): void {
  unauthorizedHandler = handler;
}