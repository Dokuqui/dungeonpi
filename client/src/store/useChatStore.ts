import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import { apiClient } from '../lib/apiClient';

export interface ChatMessage {
  id?: string;
  senderId: number;
  senderName?: string;
  content: string;
  roomId?: number;
  receiverId?: number;
  timestamp?: string;
}

export interface Mail {
  id: string;
  content: string;
  timestamp: Date;
}

interface ChatState {
  socket: Socket | null;
  localMessages: ChatMessage[];
  directMessages: ChatMessage[];
  mailbox: Mail[];
  unreadMail: number;

  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: number) => void;
  sendMessage: (content: string, roomId?: number, receiverId?: number) => void;
  markMailRead: () => void;
  fetchConversation: (contactId: number) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  localMessages: [],
  directMessages: [],
  mailbox: [],
  unreadMail: 0,

  fetchConversation: async (contactId: number) => {
    try {
      const history = await apiClient(`/chat/messages/${contactId}`);

      set({ directMessages: history });
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
    }
  },

  connect: () => {
    const token = useAuthStore.getState().token;
    if (!token || get().socket) return;

    const baseURL = import.meta.env.VITE_API_URL;

    const socket = io(`${baseURL}/chat`, {
      auth: { token },
    });

    socket.on('connect', () => console.log('✅ Connected to Chat Server!'));

    socket.on('receive_local_message', (message: ChatMessage) => {
      set((state) => ({ localMessages: [...state.localMessages, message] }));
    });

    socket.on('receive_direct_message', (message: ChatMessage) => {
      set((state) => ({ directMessages: [...state.directMessages, message] }));
    });

    socket.on(
      'system_alert',
      (data: { type: string; content: string; timestamp: string }) => {
        const newMail: Mail = {
          id: Math.random().toString(36).substr(2, 9),
          content: data.content,
          timestamp: new Date(),
        };
        set((state) => ({
          mailbox: [newMail, ...state.mailbox],
          unreadMail: state.unreadMail + 1,
        }));
      },
    );

    socket.on(
      'system_alert',
      (data: { type: string; content: string; timestamp?: string }) => {
        if (data.type === 'SECURITY_BREACH') {
          useAuthStore.getState().setSecurityAlert(data.content);

          useAuthStore.getState().logout();
        }
      },
    );

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, localMessages: [], directMessages: [] });
    }
  },

  joinRoom: (roomId: number) => {
    const { socket } = get();
    if (socket) socket.emit('join_room', { roomId });
  },

  sendMessage: (content: string, roomId?: number, receiverId?: number) => {
    const { socket } = get();
    if (!socket) return;

    if (receiverId) {
      socket.emit('send_direct_message', { receiverId, content });
    } else if (roomId) {
      socket.emit('send_local_message', { roomId, content });
    }
  },

  markMailRead: () => set({ unreadMail: 0 }),
}));
