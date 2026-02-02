'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import FireAnimation from './fire-animation';

type LlamaAvatarProps = {
  status: 'idle' | 'thinking' | 'speaking' | 'listening';
  className?: string;
};

type ParticleStyle = {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
};


export default function LlamaAvatar({ status, className }: LlamaAvatarProps) {
  const [particleStyles, setParticleStyles] = useState<ParticleStyle[]>([]);

  useEffect(() => {
    const styles = [...Array(20)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${i * 0.1}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
    }));
    setParticleStyles(styles);
  }, []);

  return (
    <div
      className={cn(
        'relative w-full h-full flex items-center justify-center',
        className
      )}
    >
      <div
        className={cn(
          'absolute bottom-[10%] w-[200%] h-[80%]',
          'bg-gradient-to-t from-primary/30 via-primary/15 to-transparent',
          'blur-3xl rounded-[50%] transition-all duration-500',
          'after:absolute after:inset-0 after:bg-accent/20 after:rounded-[50%]',
          (status === 'listening' || status === 'speaking' || status === 'thinking')
            ? 'opacity-100 scale-100'
            : 'opacity-40 scale-90'
        )}
      />

      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-radial from-primary/30 via-primary/10 to-transparent',
          'transition-all duration-700',
          status === 'thinking' && 'animate-pulse scale-125',
          status === 'listening' && 'animate-pulse scale-135 opacity-80',
          status === 'speaking' && 'animate-pulse scale-130 opacity-60',
          status !== 'thinking' && status !== 'listening' && 'scale-100 opacity-30'
        )}
      />

      <FireAnimation
        isSpeaking={status === 'speaking'}
        className="absolute bottom-[-10%] w-full h-[300px] md:h-[400px]"
      />

      <div
        className={cn(
          'relative w-full h-full max-w-[600px] max-h-[600px]',
          'transition-all duration-500 z-20',
          'flex items-center justify-center',
          status === 'thinking' && 'scale-110 animate-float',
          status === 'speaking' && 'scale-105',
          status === 'listening' && 'scale-108'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-radial from-primary/20 via-transparent to-transparent',
            'transition-all duration-500',
            (status === 'speaking' || status === 'thinking') && 'scale-125 opacity-70'
          )}
        />
        
        <Image
          src="/llama.png"
          alt="Llama Avatar"
          fill
          sizes="(max-width: 768px) 80vw, 600px"
          priority
          className="object-contain drop-shadow-2xl"
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0, 168, 255, 0.3))'
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particleStyles.map((style, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-1 h-1 rounded-full bg-primary/30',
              'animate-float-slow',
              status === 'speaking' && 'animate-pulse'
            )}
            style={style}
          />
        ))}
      </div>
    </div>
  );
}
