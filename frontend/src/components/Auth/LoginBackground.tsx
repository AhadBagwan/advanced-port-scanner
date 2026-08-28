import { useEffect, useRef } from 'react';

export const LoginBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const nodesRef = useRef<Node[]>([]);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
  }

  interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    connections: number[];
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes
    const nodes: Node[] = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      connections: [],
    }));
    nodesRef.current = nodes;

    // Initialize particles
    const particles: Particle[] = [];
    particlesRef.current = particles;

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(5, 7, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.05)';
      ctx.lineWidth = 0.5;
      const gridSize = 100;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw nodes
      nodes.forEach((node, idx) => {
        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        node.x += node.vx;
        node.y += node.vy;

        // Draw node
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 15);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(node.x - 15, node.y - 15, 30, 30);

        // Draw connections
        nodes.forEach((other, jdx) => {
          if (idx >= jdx) return;
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 300) {
            ctx.strokeStyle = `rgba(0, 217, 255, ${0.2 * (1 - dist / 300)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();

            // Draw connection node
            const midX = (node.x + other.x) / 2;
            const midY = (node.y + other.y) / 2;
            ctx.fillStyle = `rgba(0, 217, 255, ${0.3 * (1 - dist / 300)})`;
            ctx.beginPath();
            ctx.arc(midX, midY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Glow effect
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Create particles from nodes randomly
      if (Math.random() < 0.1) {
        const node = nodes[Math.floor(Math.random() * nodes.length)];
        particles.push({
          x: node.x + (Math.random() - 0.5) * 20,
          y: node.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 1,
          life: 1,
        });
      }

      // Update and draw particles
      particles.forEach((particle, idx) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy -= 0.05; // Gravity-like effect
        particle.life -= 0.01;

        if (particle.life <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.fillStyle = `rgba(0, 255, 136, ${particle.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw scan pulse
      const time = Date.now() * 0.001;
      const pulseRadius = (Math.sin(time) + 1) * 100 + 50;
      const pulseCenterX = canvas.width * 0.5;
      const pulseCenterY = canvas.height * 0.3;

      ctx.strokeStyle = `rgba(0, 217, 255, ${0.3 * (1 - (time % 3) / 3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pulseCenterX, pulseCenterY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          filter: 'drop-shadow(0 0 30px rgba(0, 217, 255, 0.1))',
        }}
      />
      {/* Overlay gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 217, 255, 0.1), transparent 70%)',
        }}
      />
    </div>
  );
};
