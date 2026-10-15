import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseTrail = useRef<Array<{ x: number; y: number; age: number; vx: number; vy: number; color: string; size: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = [
      'rgba(255, 0, 255,', // magenta
      'rgba(0, 255, 255,', // cyan
      'rgba(255, 255, 255,', // white
    ];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    // Mouse tracking for smoke trail
    const handleMouseMove = (e: MouseEvent) => {
      const colors = ['rgba(255, 0, 255,', 'rgba(0, 255, 255,'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      mouseTrail.current.push({ 
        x: e.clientX, 
        y: e.clientY, 
        age: 0,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1, // tend to rise up
        color,
        size: Math.random() * 10 + 5
      });
      // Keep only last 30 points
      if (mouseTrail.current.length > 30) {
        mouseTrail.current.shift();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, 'rgba(20, 0, 20, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${particle.alpha})`;
        ctx.fill();

        // Draw glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2
        );
        glowGradient.addColorStop(0, `${particle.color}${particle.alpha * 0.3})`);
        glowGradient.addColorStop(1, `${particle.color}0)`);
        ctx.fillStyle = glowGradient;
        ctx.fill();
      });

      // Draw mouse trail as smoke particles
      mouseTrail.current.forEach((particle) => {
        particle.age += 1;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.size += 0.3; // expand over time
        
        const alpha = Math.max(0, 1 - particle.age / 40);
        
        // Draw soft smoke particle
        const smokeGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size
        );
        smokeGradient.addColorStop(0, `${particle.color}${alpha * 0.4})`);
        smokeGradient.addColorStop(0.5, `${particle.color}${alpha * 0.2})`);
        smokeGradient.addColorStop(1, `${particle.color}0)`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = smokeGradient;
        ctx.fill();
      });

      // Remove old trail points
      mouseTrail.current = mouseTrail.current.filter(p => p.age < 40);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        background: 'linear-gradient(to bottom, #0a0a0a, #000000)',
        zIndex: 0
      }}
    />
  );
}
