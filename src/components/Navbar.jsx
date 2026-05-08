import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import useAppStore from '../store/appStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', emoji: '📊' },
  { to: '/marketplace', label: 'Marketplace', labelHi: 'बाज़ार', emoji: '🛍️' },
  { to: '/schemes', label: 'Schemes', labelHi: 'योजनाएं', emoji: '✅' },
  { to: '/clusters', label: 'Cluster', labelHi: 'समूह', emoji: '👥' },
  { to: '/notifications', label: 'Alerts', labelHi: 'सूचना', emoji: '🔔' },
];

export default function Navbar() {
  const { t, lang, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadNotifications } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60" style={{ boxShadow: '0 1px 8px rgba(31,60,136,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1F3C88] to-[#4A90E2] flex items-center justify-center text-white text-sm font-bold" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                शि
              </div>
              <div className="hidden sm:flex flex-col -space-y-0.5">
                <span className="text-[15px] font-bold text-[#1F3C88]" style={{ fontFamily: 'Sora, sans-serif' }}>ShilpMitra</span>
                <span className="text-[10px] text-slate-400 font-medium">AI Artisan Platform</span>
              </div>
            </NavLink>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink key={item.to} to={item.to}
                    className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200
                      ${isActive 
                        ? 'bg-[#EAF4FF] text-[#1F3C88]' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                    <span className="text-sm">{item.emoji}</span>
                    <span>{lang === 'hi' ? item.labelHi : item.label}</span>
                    {item.to === '/notifications' && unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadNotifications}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Language Picker */}
              <div className="relative">
                <button onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                  🌐
                  <span className="hidden sm:inline">{lang === 'hi' ? 'हिन्दी' : lang === 'kn' ? 'ಕನ್ನಡ' : 'EN'}</span>
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200/80 overflow-hidden z-50">
                        {[{ id: 'en', label: 'English', emoji: '🇬🇧' }, { id: 'hi', label: 'हिन्दी', emoji: '🇮🇳' }, { id: 'kn', label: 'ಕನ್ನಡ', emoji: '🇮🇳' }].map(l => (
                          <button key={l.id} onClick={() => { setLanguage(l.id); setLangOpen(false); }}
                            className={`w-full px-3.5 py-2.5 text-left text-[13px] font-medium flex items-center gap-2 transition-colors
                              ${lang === l.id ? 'bg-[#EAF4FF] text-[#1F3C88]' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <span>{l.emoji}</span> {l.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Avatar */}
              <button onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#1F3C88] text-white flex items-center justify-center text-[13px] font-bold hover:opacity-90 transition-opacity">
                R
              </button>

              {/* Mobile Hamburger */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors text-lg">
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-14 bottom-0 w-64 bg-white shadow-xl z-50 lg:hidden overflow-y-auto border-l border-slate-100">
              <div className="p-3 space-y-0.5">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-semibold transition-all
                      ${isActive ? 'bg-[#EAF4FF] text-[#1F3C88]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                    <span>{item.emoji}</span>
                    <span>{lang === 'hi' ? item.labelHi : item.label}</span>
                    {item.to === '/notifications' && unreadNotifications > 0 && (
                      <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                        {unreadNotifications}
                      </span>
                    )}
                  </NavLink>
                ))}
                <hr className="my-2 border-slate-100" />
                {[
                  { to: '/listings', label: 'My Listings', emoji: '📦' },
                  { to: '/ledger', label: 'Trade Ledger', emoji: '📋' },
                  { to: '/admin/policies', label: 'Admin', emoji: '⚙️' },
                ].map(item => (
                  <NavLink key={item.to} to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
