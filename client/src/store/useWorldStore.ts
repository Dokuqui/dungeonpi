import { create } from 'zustand';

interface RoomData {
  name: string;
  description: string;
  monsters: Array<{ id: number; type: string; health: number }>;
}

interface WorldState {
  currentRoom: RoomData | null;
  setRoom: (room: RoomData) => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  currentRoom: null,
  setRoom: (room) => set({ currentRoom: room }),
}));
