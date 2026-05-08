import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/marketplace', icon: 'storefront', label: 'बाज़ार' },
  { to: '/dashboard', icon: 'space_dashboard', label: 'डैशबोर्ड' },
  { to: '/schemes', icon: 'verified', label: 'योजनाएं' },
  { to: '/clusters', icon: 'groups', label: 'क्लस्टर' },
  { to: '/profile', icon: 'person', label: 'प्रोफ़ाइल' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 glass-card border-t border-white/40 shadow-nav">
      <div className="flex justify-around items-center px-2 pb-3 pt-1.5 max-w-xl mx-auto">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-2xl px-2 py-1 transition-all duration-300 ${
                isActive
                  ? 'text-primary bg-primary-container scale-95'
                  : 'text-on-surface-variant opacity-60 hover:opacity-100'
              }`
            }>
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-[22px] mb-0.5 ${isActive ? 'filled' : ''}`}>{tab.icon}</span>
                <span className="font-hindi text-[10px] font-medium leading-tight">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
