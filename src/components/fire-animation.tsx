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
  colorType: 'blue' | 'purple' | 'mixed';
};

const FireAnimation = ({ isSpeaking, className }: FireAnimationProps) => {
  const fireContainerRef = useRef<HTMLDivElement>(null);
  const firesRef = useRef<Fire[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const baseTimeRef = useRef(0);

  useEffect(() => {
    const fireContainer = fireContainerRef.current;
    if (!fireContainer) return;

    let fireCount = 21;
    if (window.innerWidth < 768) {
        fireCount = 15;
    } else if (window.innerWidth < 480) {
        fireCount = 11;
    }

    const createFires = () => {
      if (!fireContainer) return;
      fireContainer.innerHTML = '';
      firesRef.current = [];

      const centerX = fireContainer.offsetWidth / 2;
      const radius = Math.min(centerX * 1.2, 600);

      for (let i = 0; i < fireCount; i++) {
        const fireElement = document.createElement('div');
        
        const angleRange = Math.PI * 1.2;
        const startAngle = Math.PI + (Math.PI * 0.1);
        const angle = startAngle + (i / (fireCount - 1)) * angleRange;

        const x = centerX + Math.cos(angle) * radius;
        const y = fireContainer.offsetHeight * 0.3;

        const distanceFromCenter = Math.abs(i - (fireCount - 1) / 2) / ((fireCount - 1) / 2);
        const sizeFactor = 0.5 + distanceFromCenter * 0.5;
        const width = 40 + sizeFactor * 90;
        const height = 60 + sizeFactor * 140;

        const positionRatio = i / (fireCount - 1);
        let colorType: 'blue' | 'purple' | 'mixed';
        let background, boxShadow;

        if (positionRatio < 0.4) {
          colorType = 'blue';
          background = 'radial-gradient(circle at 30% 20%, #00a8ff, #0097e6 30%, #0078b3 60%, #005a87 90%)';
          boxShadow = `
            0 0 50px 20px rgba(0, 168, 255, 0.8),
            0 0 100px 30px rgba(0, 168, 255, 0.4),
            inset 0 -15px 30px rgba(255, 255, 255, 0.3)
          `;
        } else if (positionRatio > 0.6) {
          colorType = 'purple';
          background = 'radial-gradient(circle at 70% 20%, #9c88ff, #8c7ae6 30%, #7d5fff 60%, #6c5ce7 90%)';
          boxShadow = `
            0 0 50px 20px rgba(156, 136, 255, 0.8),
            0 0 100px 30px rgba(156, 136, 255, 0.4),
            inset 0 -15px 30px rgba(255, 255, 255, 0.3)
          `;
        } else {
          colorType = 'mixed';
          background = 'radial-gradient(circle at 50% 20%, rgba(100, 150, 255, 0.95), rgba(120, 100, 220, 0.85) 30%, rgba(140, 80, 200, 0.75) 60%, rgba(160, 60, 180, 0.65) 90%)';
          boxShadow = `
            0 0 60px 25px rgba(120, 100, 255, 0.9),
            0 0 120px 40px rgba(120, 100, 255, 0.5),
            inset 0 -20px 40px rgba(255, 255, 255, 0.4)
          `;
        }

        fireElement.style.position = 'absolute';
        fireElement.style.borderRadius = '40% 40% 60% 60%';
        fireElement.style.filter = 'blur(12px)';
        fireElement.style.opacity = '0.95';
        fireElement.style.transformOrigin = 'bottom center';
        fireElement.style.background = background;
        fireElement.style.boxShadow = boxShadow;
        fireElement.style.width = `${width}px`;
        fireElement.style.height = `${height}px`;
        fireElement.style.left = `${x - width / 2}px`;
        fireElement.style.bottom = `${-height * 0.3}px`;

        firesRef.current.push({
          element: fireElement,
          baseWidth: width,
          baseHeight: height,
          baseX: x,
          baseY: y,
          angle: angle,
          sizeFactor: sizeFactor,
          positionRatio: positionRatio,
          oscillationSpeed: 1.0 + Math.random() * 0.6,
          oscillationPhase: Math.random() * Math.PI * 2,
          colorType
        });

        fireContainer.appendChild(fireElement);
      }
    };

    const animateFires = () => {
      baseTimeRef.current += 0.04;

      firesRef.current.forEach((fire, index) => {
        const time = baseTimeRef.current;
        
        const energy1 = Math.sin(time * (8 + fire.sizeFactor * 3) + fire.oscillationPhase);
        const energy2 = Math.sin(time * 4 + index / 3);
        const energy3 = Math.cos(time * 2 + index / 7);
        const randomJitter = (Math.random() - 0.5) * 0.4;

        let voiceEnergy = (energy1 * 0.5 + energy2 * 0.3 + energy3 * 0.2 + 1) / 2;
        voiceEnergy = voiceEnergy * 1.1 + 0.1;
        voiceEnergy += randomJitter;
        voiceEnergy = Math.max(0.2, Math.min(1.5, voiceEnergy));

        const newHeight = fire.baseHeight * voiceEnergy * (1 + fire.sizeFactor * 0.3);
        const newWidth = fire.baseWidth * (voiceEnergy * 0.8 + 0.2);
        
        const verticalOscillation = (voiceEnergy - 0.5) * 40 * fire.sizeFactor;
        const horizontalOscillation = Math.sin(time * fire.oscillationSpeed) * 15;

        fire.element.style.height = `${newHeight}px`;
        fire.element.style.width = `${newWidth}px`;
        fire.element.style.left = `${fire.baseX - newWidth / 2 + horizontalOscillation}px`;
        fire.element.style.bottom = `${Math.max(-newHeight * 0.3, verticalOscillation * 0.5)}px`;

        const opacity = 0.7 + voiceEnergy * 0.5;
        const blur = 6 + (1 - voiceEnergy) * 10;

        if (isSpeaking) {
          const colorIntensity = voiceEnergy * 1.2;
          let newBackground = fire.element.style.background;
          
          if (fire.colorType === 'blue') {
            newBackground = `radial-gradient(circle at 30% 20%, 
              rgba(${100 + colorIntensity * 155}, ${168 + colorIntensity * 87}, 255, 0.95),
              rgba(0, ${152 + colorIntensity * 104}, ${230 + colorIntensity * 25}, 0.85) 30%,
              rgba(0, ${120 + colorIntensity * 135}, ${179 + colorIntensity * 76}, 0.75) 60%,
              rgba(0, ${90 + colorIntensity * 165}, ${135 + colorIntensity * 120}, 0.65) 90%)`;
          } else if (fire.colorType === 'purple') {
            newBackground = `radial-gradient(circle at 70% 20%, 
              rgba(${156 + colorIntensity * 99}, ${136 + colorIntensity * 119}, 255, 0.95),
              rgba(${140 + colorIntensity * 115}, ${122 + colorIntensity * 133}, 230, 0.85) 30%,
              rgba(${125 + colorIntensity * 130}, ${95 + colorIntensity * 160}, 255, 0.75) 60%,
              rgba(${108 + colorIntensity * 147}, ${92 + colorIntensity * 163}, 231, 0.65) 90%)`;
          }
          
          fire.element.style.background = newBackground;
        }

        fire.element.style.opacity = opacity.toString();
        fire.element.style.filter = `blur(${blur}px) brightness(${0.8 + voiceEnergy * 0.4})`;
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
      
      firesRef.current.forEach(fire => {
        const calmHeight = fire.baseHeight * 0.5;
        const calmWidth = fire.baseWidth * 0.6;
        fire.element.style.height = `${calmHeight}px`;
        fire.element.style.width = `${calmWidth}px`;
        fire.element.style.left = `${fire.baseX - calmWidth / 2}px`;
        fire.element.style.bottom = `${-calmHeight * 0.3}px`;
        fire.element.style.opacity = '0.6';
        fire.element.style.filter = 'blur(12px) brightness(0.7)';
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
        'bg-gradient-to-t from-primary/20 via-primary/10 to-transparent',
        'transition-opacity duration-500',
        isSpeaking ? 'opacity-100' : 'opacity-30'
      )} />
      
      <div
        ref={fireContainerRef}
        className="absolute bottom-0 w-full h-full"
      />
    </div>
  );
};

export default FireAnimation;