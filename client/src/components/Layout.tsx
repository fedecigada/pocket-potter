import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>
    </>
  );
}
