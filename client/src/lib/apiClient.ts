import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = useAuthStore.getState().token;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    const refreshToken = useAuthStore.getState().refreshToken;

    if (refreshToken) {
      try {
        console.log('Access token expired. Attempting refresh...');

        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const newTokens = await refreshRes.json();

          useAuthStore
            .getState()
            .setTokens(newTokens.accessToken, newTokens.refreshToken);

          headers.set('Authorization', `Bearer ${newTokens.accessToken}`);

          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          console.warn('Refresh token expired. Logging out...');
          useAuthStore.getState().logout();
          throw new Error('Session expired. Please log in again.');
        }
      } catch (err) {
        console.warn('Refresh process failed. Logging out...');
        useAuthStore.getState().logout();
        throw err;
      }
    } else {
      console.warn('No refresh token found. Logging out...');
      useAuthStore.getState().logout();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
};
