import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';

export default function TopBar() {
  const navigate = useNavigate();
  const { unreadNotifications, language, setLanguage } = useAppStore();

  return (
    <header className="fixed top-0 z-50 w-full glass-card border-b border-white/40">
      <div className="flex justify-between items-center w-full px-safe-margin py-xs max-w-xl mx-auto h-14">
        <button onClick={() => navigate(-1)} className="w-9 h-9 text-primary hover:bg-primary-container transition-colors rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5">
          <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[16px] filled">auto_awesome</span>
          </div>
          <span className="font-heading text-body font-bold text-primary">शिल्पमित्र</span>
        </button>
        <div className="flex items-center gap-0.5">
          <button onClick={() => navigate('/notifications')} className="w-9 h-9 text-primary hover:bg-primary-container transition-colors rounded-xl flex items-center justify-center relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadNotifications}</span>
            )}
          </button>
          <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="w-9 h-9 text-primary-light hover:bg-primary-container transition-colors rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">translate</span>
          </button>
        </div>
      </div>
    </header>
  );
}
