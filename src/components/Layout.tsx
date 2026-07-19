import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Layout() {
  const { pathname } = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background bg-net relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <main className={isTransitioning ? 'animate-fade-in' : ''}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
