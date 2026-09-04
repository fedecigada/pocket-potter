import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Layout from '@/components/Layout';
import DashboardPage from '@/DashboardPage';
import AlbumPage from '@/AlbumPage';
import ShopPage from '@/ShopPage';
import ScambiPage from '@/ScambiPage';
import GuidaPage from '@/GuidaPage';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/album" element={<AlbumPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/scambi" element={<ScambiPage />} />
            <Route path="/guida" element={<GuidaPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
