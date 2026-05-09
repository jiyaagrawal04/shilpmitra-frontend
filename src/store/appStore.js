import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Current user (demo default — Raju)
  currentUser: {
    id: 'a1',
    name: 'Raju Kumar',
    nameHi: 'राजू कुमार',
    craft: 'Pottery',
    location: 'Khurja, UP',
    state: 'Uttar Pradesh',
    totalSales: 81700,
  },
  setCurrentUser: (user) => set({ currentUser: user }),

  // Language (synced with useTranslation hook via localStorage)
  language: localStorage.getItem('shilpmitra_lang') || 'en',
  setLanguage: (lang) => {
    localStorage.setItem('shilpmitra_lang', lang);
    document.documentElement.lang = lang;
    set({ language: lang });
  },

  // Notifications
  unreadNotifications: 2,
  setUnreadCount: (count) => set({ unreadNotifications: count }),
  incrementUnread: () => set((s) => ({ unreadNotifications: s.unreadNotifications + 1 })),
  markNotificationRead: () => set((s) => ({
    unreadNotifications: Math.max(0, s.unreadNotifications - 1),
  })),
}));

export default useAppStore;
