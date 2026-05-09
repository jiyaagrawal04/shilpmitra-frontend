import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Landing from './pages/Landing';
import About from './pages/About';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Listings from './pages/Listings';
import NewListing from './pages/NewListing';
import TradeLedger from './pages/TradeLedger';
import SchemeNavigator from './pages/SchemeNavigator';
import ClusterManagement from './pages/ClusterManagement';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminPolicies from './pages/AdminPolicies';
import ChatAssistant from './components/ChatAssistant';
import useAppStore from './store/appStore';

export default function App() {
  const initUser = useAppStore((s) => s.initUser);
  useEffect(() => { initUser(); }, [initUser]);
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages — no nav */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App pages — with top navbar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ProductDetail />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/new" element={<NewListing />} />
          <Route path="/ledger" element={<TradeLedger />} />
          <Route path="/schemes" element={<SchemeNavigator />} />
          <Route path="/clusters" element={<ClusterManagement />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/policies" element={<AdminPolicies />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating chat button — visible on all app pages */}
      <ChatAssistant />
    </BrowserRouter>
  );
}
