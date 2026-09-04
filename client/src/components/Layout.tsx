import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="py-8">
        <Outlet />
      </main>
    </>
  );
}
