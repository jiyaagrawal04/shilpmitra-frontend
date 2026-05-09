import { create } from 'zustand';
import { isDemo } from '../lib/supabase';
import { artisans } from '../data/demoData';

// Demo user ID used in demoData
const DEMO_USER_ID = 'a1';
// Supabase demo user (from seed.js) — phone-based lookup
const SUPABASE_DEMO_PHONE = '9876543210';

const useAppStore = create((set, get) => ({
  // Current user — starts with demo default, can be upgraded to Supabase
  currentUser: {
    id: DEMO_USER_ID,
    name: 'Raju Kumar',
    nameHi: 'राजू कुमार',
    craft: 'Pottery',
    craft_type: 'Pottery',
    location: 'Khurja, UP',
    state: 'Uttar Pradesh',
    totalSales: 81700,
    group_status: 'OBC',
  },
  userLoaded: false,
  setCurrentUser: (user) => set({ currentUser: user, userLoaded: true }),

  // Initialize user from Supabase (called once on app mount)
  initUser: async () => {
    if (get().userLoaded) return;
    if (isDemo) {
      // Demo mode: use demoData artisan
      const demoUser = artisans[0];
      set({
        currentUser: {
          ...demoUser,
          craft_type: demoUser.craft,
          group_status: 'OBC',
        },
        userLoaded: true,
      });
      return;
    }

    // Live mode: load the seeded Raju user from Supabase
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('phone', SUPABASE_DEMO_PHONE)
        .single();

      if (user) {
        set({
          currentUser: {
            id: user.id,
            name: user.name,
            nameHi: 'राजू कुमार',
            craft: user.craft_type,
            craft_type: user.craft_type,
            location: user.location,
            state: user.state,
            totalSales: 81700,
            group_status: user.group_status || 'OBC',
            phone: user.phone,
            upi_id: user.upi_id,
            aadhaar_last4: user.aadhaar_last4,
          },
          userLoaded: true,
        });
        console.log('[AppStore] Loaded Supabase user:', user.name, user.id);
      } else {
        console.warn('[AppStore] Supabase user not found, using demo data');
        set({ userLoaded: true });
      }
    } catch (e) {
      console.error('[AppStore] Failed to load user:', e);
      set({ userLoaded: true });
    }
  },

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
