'use client';

import { useRef, useEffect } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles: Particle[] = [];

    const resizeHandler = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeHandler);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.size > 0.1) this.size -= 0.01;

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.size = Math.random() * 1.5 + 0.5;
          this.speedX = Math.random() * 0.4 - 0.2;
          this.speedY = Math.random() * 0.4 - 0.2;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        opacity: 0.5,
      }}
    />
  );
};

export default ParticleBackground;
