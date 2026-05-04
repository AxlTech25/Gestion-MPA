import { create } from 'zustand';

export const useGlobalStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  // Acciones
  setUser: (userData) => set({ user: userData, isAuthenticated: !!userData }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
