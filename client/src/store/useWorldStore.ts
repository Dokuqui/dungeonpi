import { create } from 'zustand';

interface RoomData {
  x: number;
  y: number;
  name?: string;
  description?: string;
  monsters?: Array<{ id: number; type: string; health: number }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  players?: any[];
}

interface WorldState {
  currentRoom: RoomData | null;
  room: RoomData | null;
  setRoom: (room: RoomData) => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  currentRoom: null,
  room: null,
  setRoom: (room) => set({ currentRoom: room }),
}));
