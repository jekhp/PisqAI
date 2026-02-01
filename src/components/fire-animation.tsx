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

    let fireCount = 15;
    if (window.innerWidth < 768) {
        fireCount = 11;
    } else if (window.innerWidth < 480) {
        fireCount = 9;
    }

    const createFires = () => {
      if (!fireContainer) return;
      fireContainer.innerHTML = '';
      firesRef.current = [];

      const centerX = fireContainer.offsetWidth / 2;
      const radius = Math.min(centerX * 0.9, 400);

      for (let i = 0; i < fireCount; i++) {
        const fireElement = document.createElement('div');
        
        const angleRange = Math.PI;
        const startAngle = Math.PI;
        const angle = startAngle + (i / (fireCount - 1)) * angleRange;

        const x = centerX + Math.cos(angle) * radius;
        const y = fireContainer.offsetHeight - 50;

        const distanceFromCenter = Math.abs(i - (fireCount - 1) / 2) / ((fireCount - 1) / 2);
        const sizeFactor = 0.4 + distanceFromCenter * 0.6;
        const width = 30 + sizeFactor * 70;
        const height = 40 + sizeFactor * 110;

        const positionRatio = i / (fireCount - 1);
        let background, boxShadow;

        if (positionRatio < 0.45) {
          background = 'radial-gradient(circle at 30% 20%, #00a8ff, #0097e6 40%, #0078b3 70%, #005a87)';
          boxShadow = '0 0 30px 10px rgba(0, 168, 255, 0.7), inset 0 -10px 20px rgba(255, 255, 255, 0.2)';
        } else if (positionRatio > 0.55) {
          background = 'radial-gradient(circle at 70% 20%, #9c88ff, #8c7ae6 40%, #7d5fff 70%, #6c5ce7)';
          boxShadow = '0 0 30px 10px rgba(156, 136, 255, 0.7), inset 0 -10px 20px rgba(255, 255, 255, 0.2)';
        } else {
          background = 'radial-gradient(circle at 50% 20%, rgba(100, 150, 255, 0.9), rgba(120, 100, 220, 0.8) 40%, rgba(140, 80, 200, 0.7) 70%, rgba(160, 60, 180, 0.6))';
          boxShadow = '0 0 40px 15px rgba(120, 100, 255, 0.8), inset 0 -10px 25px rgba(255, 255, 255, 0.3)';
        }

        fireElement.style.position = 'absolute';
        fireElement.style.borderRadius = '50% 50% 40% 40%';
        fireElement.style.filter = 'blur(8px)';
        fireElement.style.opacity = '0.9';
        fireElement.style.transformOrigin = 'bottom center';
        fireElement.style.background = background;
        fireElement.style.boxShadow = boxShadow;
        fireElement.style.width = `${width}px`;
        fireElement.style.height = `${height}px`;
        fireElement.style.left = `${x - width / 2}px`;
        fireElement.style.bottom = '0';

        firesRef.current.push({
          element: fireElement,
          baseWidth: width,
          baseHeight: height,
          baseX: x,
          baseY: y,
          angle: angle,
          sizeFactor: sizeFactor,
          positionRatio: positionRatio,
          oscillationSpeed: 0.8 + Math.random() * 0.4,
          oscillationPhase: Math.random() * Math.PI * 2,
        });

        fireContainer.appendChild(fireElement);
      }
    };

    const animateFires = () => {
      baseTimeRef.current += 0.02;

      firesRef.current.forEach((fire, index) => {
        const time = baseTimeRef.current * 1.5;

        const sizeOscillation = Math.sin(time * fire.oscillationSpeed + fire.oscillationPhase) * Math.sin(time * 0.3) * 0.3 + 1;
        const verticalOscillation = Math.sin(time * fire.oscillationSpeed * 1.2 + fire.oscillationPhase * 0.7) * 15;
        const horizontalOscillation = Math.cos(time * fire.oscillationSpeed * 0.8 + fire.oscillationPhase) * 10;

        const newWidth = fire.baseWidth * sizeOscillation;
        const newHeight = fire.baseHeight * (sizeOscillation * 0.9 + 0.1);

        fire.element.style.width = `${newWidth}px`;
        fire.element.style.height = `${newHeight}px`;
        fire.element.style.left = `${fire.baseX - newWidth / 2 + horizontalOscillation}px`;
        fire.element.style.bottom = `${verticalOscillation}px`;

        const opacity = 0.7 + Math.sin(time * 2 + index) * 0.2;
        const blur = 6 + Math.sin(time * 3 + index) * 2;

        fire.element.style.opacity = opacity.toString();
        fire.element.style.filter = `blur(${blur}px)`;
      });

      animationIdRef.current = requestAnimationFrame(animateFires);
    };

    createFires();

    if (isSpeaking) {
      if (!animationIdRef.current) {
        animateFires();
      }
    } else {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
       firesRef.current.forEach(fire => {
            fire.element.style.width = `${fire.baseWidth * 0.8}px`;
            fire.element.style.height = `${fire.baseHeight * 0.8}px`;
            fire.element.style.left = `${fire.baseX - (fire.baseWidth * 0.8) / 2}px`;
            fire.element.style.bottom = `0px`;
            fire.element.style.opacity = '0.7';
            fire.element.style.filter = 'blur(8px)';
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
        'absolute w-full h-[200px] transition-opacity duration-500 pointer-events-none',
        isSpeaking ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div className="absolute bottom-0 w-full h-[150px] bg-gradient-to-t from-[#0A0E17]/80 to-transparent" />
      <div
        ref={fireContainerRef}
        className="absolute bottom-0 w-full h-full"
      />
    </div>
  );
};

export default FireAnimation;
