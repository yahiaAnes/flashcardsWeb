// import { create } from 'zustand';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   plan: 'free' | 'basic' | 'premium';
//   tokensUsed: number;
//   quota: number;
// }

// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   login: (user: User) => void;
//   logout: () => void;
//   updateUser: (user: Partial<User>) => void;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   isAuthenticated: false,
//   login: (user) => set({ user, isAuthenticated: true }),
//   logout: () => set({ user: null, isAuthenticated: false }),
//   updateUser: (updates) => set((state) => ({
//     user: state.user ? { ...state.user, ...updates } : null,
//   })),
// }));

