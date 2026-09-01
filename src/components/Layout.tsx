import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background bg-net relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <main key={pathname} className="animate-fade-in">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
