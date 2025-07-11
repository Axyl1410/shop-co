export const ServerAxiosConfig = {
  headers: {
    'X-Api-Key': import.meta.env.VITE_API_HEADER,
  },
  baseURL: import.meta.env.VITE_BASE_API_URL,
}
