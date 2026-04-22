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
    (set) => ({
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

      logout: () => {
        set({
          token: null,
          refreshToken: null,
          character: null,
          userId: null,
          role: null,
        });
      },

      securityAlert: null,

      setSecurityAlert: (message) => set({ securityAlert: message }),
    }),
    { name: 'dungeon-auth' },
  ),
);
