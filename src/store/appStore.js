import { create } from 'zustand';

const useAppStore = create((set) => ({
  currentUser: {
    id: 'a1', name: 'Raju Kumar', nameHi: 'राजू कुमार', craft: 'Handloom', location: 'Varanasi, UP',
  },
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  unreadNotifications: 2,
  markNotificationRead: () => set((s) => ({ unreadNotifications: Math.max(0, s.unreadNotifications - 1) })),
}));

export default useAppStore;
