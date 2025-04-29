import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
      throw new Error(`Rate limited. Please try again in ${delay/1000} seconds.`);
    }
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Check if server is available
    const serverUrl = new URL(url, window.location.origin);
    const res = await fetch(serverUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        const errorJson = JSON.parse(text);
        throw new Error(errorJson.message || `HTTP error! status: ${res.status}`);
      } catch {
        throw new Error(text || `HTTP error! status: ${res.status}`);
      }
    }

    return res;
  } catch (error) {
    console.error('API Request Error:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('השרת לא זמין כרגע. אנא נסה שוב מאוחר יותר.');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const serverUrl = new URL(queryKey[0] as string, window.location.origin);
      const res = await fetch(serverUrl, {
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const errorJson = JSON.parse(text);
          throw new Error(errorJson.message || `HTTP error! status: ${res.status}`);
        } catch {
          throw new Error(text || `HTTP error! status: ${res.status}`);
        }
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      return await res.json();
    } catch (error) {
      console.error('Query Function Error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('השרת לא זמין כרגע. אנא נסה שוב מאוחר יותר.');
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
