'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type FireAnimationProps = {
  isSpeaking: boolean;
  className?: string;
};

type Fire = {
  element: HTMLDivElement;
  baseWidth: number;
  baseHeight: number;
  baseX: number;
  baseY: number;
  angle: number;
  sizeFactor: number;
  positionRatio: number;
  oscillationSpeed: number;
  oscillationPhase: number;
};

const FireAnimation = ({ isSpeaking, className }: FireAnimationProps) => {
  const fireContainerRef = useRef<HTMLDivElement>(null);
  const firesRef = useRef<Fire[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const baseTimeRef = useRef(0);

  useEffect(() => {
    const fireContainer = fireContainerRef.current;
    if (!fireContainer) return;

    // Reduced fire count for performance
    let fireCount = 18;
    if (window.innerWidth < 768) {
      fireCount = 12;
    } else if (window.innerWidth < 480) {
      fireCount = 8;
    }

    const createFires = () => {
      if (!fireContainer) return;
      fireContainer.innerHTML = '';
      firesRef.current = [];

      const centerX = fireContainer.offsetWidth / 2;
      const radius = Math.min(centerX * 1.1, 500);

      for (let i = 0; i < fireCount; i++) {
        const fireElement = document.createElement('div');
        
        const angleRange = Math.PI * 1.1;
        const startAngle = Math.PI + (Math.PI * 0.05);
        const angle = startAngle + (i / (fireCount - 1)) * angleRange;

        const x = centerX + Math.cos(angle) * radius;
        const y = fireContainer.offsetHeight * 0.3;

        const distanceFromCenter = Math.abs(i - (fireCount - 1) / 2) / ((fireCount - 1) / 2);
        const sizeFactor = 0.4 + distanceFromCenter * 0.6;
        // Slightly smaller flames
        const width = 30 + sizeFactor * 70;
        const height = 50 + sizeFactor * 110;

        const positionRatio = i / (fireCount - 1);
        let background, boxShadow;

        // Simplified shadows for better performance
        if (positionRatio < 0.4) {
          background = 'radial-gradient(circle, #00a8ff, #0078b3 60%, transparent 90%)';
          boxShadow = `0 0 30px 10px rgba(0, 168, 255, 0.5)`;
        } else if (positionRatio > 0.6) {
          background = 'radial-gradient(circle, #9c88ff, #7d5fff 60%, transparent 90%)';
          boxShadow = `0 0 30px 10px rgba(156, 136, 255, 0.5)`;
        } else {
          background = 'radial-gradient(circle, rgba(100, 150, 255, 0.9), rgba(140, 80, 200, 0.7) 70%, transparent 90%)';
          boxShadow = `0 0 40px 15px rgba(120, 100, 255, 0.6)`;
        }

        fireElement.style.position = 'absolute';
        fireElement.style.borderRadius = '50%'; // Simple circle is faster to render
        fireElement.style.filter = 'blur(10px)'; // Consistent blur
        fireElement.style.opacity = '0.9';
        fireElement.style.transformOrigin = 'bottom center';
        fireElement.style.background = background;
        fireElement.style.boxShadow = boxShadow;
        fireElement.style.width = `${width}px`;
        fireElement.style.height = `${height}px`;
        fireElement.style.left = `${x - width / 2}px`;
        fireElement.style.bottom = `${-height * 0.2}px`;

        firesRef.current.push({
          element: fireElement,
          baseWidth: width,
          baseHeight: height,
          baseX: x,
          baseY: y,
          angle: angle,
          sizeFactor: sizeFactor,
          positionRatio: positionRatio,
          oscillationSpeed: 0.9 + Math.random() * 0.4,
          oscillationPhase: Math.random() * Math.PI * 2,
        });

        fireContainer.appendChild(fireElement);
      }
    };

    const animateFires = () => {
      baseTimeRef.current += 0.05; // Slightly faster time progression

      firesRef.current.forEach((fire) => {
        const time = baseTimeRef.current;
        
        // Simplified energy calculation for performance
        const energy1 = Math.sin(time * (5 + fire.sizeFactor * 2) + fire.oscillationPhase);
        const energy2 = Math.sin(time * 2);
        
        let voiceEnergy = (energy1 * 0.7 + energy2 * 0.3 + 1) / 2;
        voiceEnergy = Math.max(0.3, Math.min(1.4, voiceEnergy));

        // Use transforms for position and scale, which are more performant
        const scaleY = voiceEnergy * (1 + fire.sizeFactor * 0.2);
        const scaleX = (voiceEnergy * 0.6 + 0.4);
        const translateY = (voiceEnergy - 0.5) * 20 * fire.sizeFactor;
        const translateX = Math.sin(time * fire.oscillationSpeed) * 8;

        fire.element.style.transform = `translate(${translateX}px, ${-translateY}px) scale(${scaleX}, ${scaleY})`;
        fire.element.style.opacity = (0.6 + voiceEnergy * 0.4).toString();
      });

      animationIdRef.current = requestAnimationFrame(animateFires);
    };

    createFires();

    if (isSpeaking) {
      if (!animationIdRef.current) {
        baseTimeRef.current = 0;
        animateFires();
      }
    } else {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      
      // Calm state with transforms
      firesRef.current.forEach(fire => {
        fire.element.style.transform = `translate(0, 0) scale(0.6, 0.5)`;
        fire.element.style.opacity = '0.5';
      });
    }

    const handleResize = () => createFires();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isSpeaking]);

  return (
    <div
      className={cn(
        'absolute w-full transition-all duration-700 pointer-events-none overflow-visible',
        'opacity-100',
        className
      )}
    >
      <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-[#0A0E17]/90 via-transparent to-transparent" />
      
      <div className={cn(
        'absolute bottom-0 w-full h-[200px]',
        'bg-gradient-to-t from-primary/15 via-primary/5 to-transparent',
        'transition-opacity duration-500',
        isSpeaking ? 'opacity-80' : 'opacity-20'
      )} />
      
      <div
        ref={fireContainerRef}
        className="absolute bottom-0 w-full h-full"
      />
    </div>
  );
};

export default FireAnimation;
