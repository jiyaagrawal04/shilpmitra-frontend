import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/appStore';

export default function TopBar() {
  const navigate = useNavigate();
  const { unreadNotifications, language, setLanguage } = useAppStore();

  return (
    <header className="fixed top-0 z-50 w-full bg-surface/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center w-full px-safe-margin py-xs max-w-xl mx-auto h-16">
        <button onClick={() => navigate(-1)} className="p-2 text-primary hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-h2-headline text-h2-headline font-bold text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>शिल्पमित्र</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/notifications')} className="p-2 text-primary hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center relative">
            <span className="material-symbols-outlined">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">{unreadNotifications}</span>
            )}
          </button>
          <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="p-2 text-primary hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">translate</span>
          </button>
        </div>
      </div>
    </header>
  );
}
