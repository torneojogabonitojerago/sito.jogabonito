import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IntroSplash from '@/components/IntroSplash';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <IntroSplash />
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main key={pathname} className="flex-1 animate-fade-in">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
