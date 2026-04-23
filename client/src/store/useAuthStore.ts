import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CharacterData {
  id: number;
  name: string;
  userId: number;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  userId: number | null;
  character: CharacterData | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAuth: (token: string, role: string, userId: number) => void;
  setCharacter: (char: CharacterData | null) => void;
  logout: () => void;
  securityAlert: string | null;
  setSecurityAlert: (message: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      role: null,
      userId: null,
      character: null,

      setTokens: (accessToken, refreshToken) => {
        set({ token: accessToken, refreshToken });
      },

      setAuth: (token, role, userId) => {
        set({ token, role, userId });
      },

      setCharacter: (character) => set({ character }),

      logout: async () => {
        const refreshToken = get().refreshToken;

        if (refreshToken) {
          try {
            const BASE_URL = import.meta.env.VITE_API_URL;
            await fetch(`${BASE_URL}/auth/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
          } catch (error) {
            console.error('Failed to notify backend of logout', error);
          }
        }

        set({
          token: null,
          refreshToken: null,
          character: null,
          userId: null,
          role: null,
          securityAlert: null,
        });
      },

      securityAlert: null,

      setSecurityAlert: (message) => set({ securityAlert: message }),
    }),
    { name: 'dungeon-auth' },
  ),
);
