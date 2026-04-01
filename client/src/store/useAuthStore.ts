import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CharacterData {
  id: number;
  name: string;
}

interface AuthState {
  token: string | null;
  role: string | null;
  userId: number | null;
  character: CharacterData | null;
  setAuth: (token: string, role: string, userId: number) => void;
  setCharacter: (char: CharacterData | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      character: null,
      setAuth: (token, role, userId) => set({ token, role, userId }),
      setCharacter: (character) => set({ character }),
      logout: () =>
        set({ token: null, role: null, userId: null, character: null }),
    }),
    { name: 'dungeon-auth' },
  ),
);
