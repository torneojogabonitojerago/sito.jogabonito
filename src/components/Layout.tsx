import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background bg-net">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
