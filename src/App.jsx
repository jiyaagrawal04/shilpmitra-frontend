import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
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
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
