import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import Layout from '@/components/Layout';
import DashboardPage from '@/DashboardPage';
import AlbumPage from '@/AlbumPage';
import ShopPage from '@/ShopPage';
import TradesPage from '@/TradesPage';
import GuidePage from '@/GuidePage';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/album" element={<AlbumPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/trades" element={<TradesPage />} />
            <Route path="/guide" element={<GuidePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
