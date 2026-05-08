import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <main className="pt-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
