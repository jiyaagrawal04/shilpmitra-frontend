import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/marketplace', icon: 'storefront', label: 'बाज़ार' },
  { to: '/dashboard', icon: 'dashboard', label: 'डैशबोर्ड' },
  { to: '/schemes', icon: 'account_balance', label: 'योजनाएं' },
  { to: '/profile', icon: 'person', label: 'प्रोफ़ाइल' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-nav rounded-t-xl md:hidden">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-h-[48px] min-w-[48px] rounded-full px-3 py-1 transition-all duration-200 ${
              isActive
                ? 'bg-primary-container text-on-primary-container scale-90'
                : 'text-on-surface-variant opacity-70 hover:bg-surface-container-highest/50'
            }`
          }>
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined mb-1 ${isActive ? 'filled' : ''}`}>{tab.icon}</span>
              <span className="font-label-caps text-label-caps text-[10px]">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
