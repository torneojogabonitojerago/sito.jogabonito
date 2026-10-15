import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IntroSplash from '@/components/IntroSplash';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="bg-site flex min-h-screen flex-col overflow-x-clip">
      <IntroSplash />
      <Navbar />
      <main key={pathname} className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
