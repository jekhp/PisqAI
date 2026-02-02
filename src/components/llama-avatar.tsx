import Image from 'next/image';
import { cn } from '@/lib/utils';
import FireAnimation from './fire-animation';

type LlamaAvatarProps = {
  status: 'idle' | 'thinking' | 'speaking' | 'listening';
  className?: string;
};

export default function LlamaAvatar({ status, className }: LlamaAvatarProps) {
  return (
    <div
      className={cn(
        'relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center',
        className
      )}
    >
      {/* Fondo base siempre visible */}
      <div className="absolute bottom-[10%] w-[160%] h-[60%] bg-gradient-radial from-primary/10 via-primary/5 to-transparent blur-3xl rounded-[50%]" />

      {/* Fire Animation - SIEMPRE VISIBLE */}
      <FireAnimation
        isSpeaking={status === 'speaking'}
        alwaysVisible={true}
        className="bottom-[-15%] md:bottom-[-20%] z-0"
      />

      {/* Efecto de pulso según estado */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-all duration-500',
          status === 'thinking' && 'bg-primary/10 animate-pulse',
          status === 'listening' && 'bg-green-500/10 animate-pulse',
          status !== 'thinking' && status !== 'listening' && 'opacity-0'
        )}
      />

      {/* Llama Image con efectos según estado */}
      <div
        className={cn(
          'relative w-full h-full transition-all duration-500 z-10',
          status === 'speaking' && 'animate-glow scale-105',
          status === 'thinking' && 'animate-pulse-subtle'
        )}
      >
        <Image
          src="/llama.png"
          alt="Llama Avatar"
          fill
          sizes="(max-width: 768px) 16rem, 24rem"
          priority
          className="object-contain drop-shadow-xl"
          style={{
            filter: status === 'speaking' 
              ? 'brightness(1.1) saturate(1.1)' 
              : 'brightness(1) saturate(1)'
          }}
        />
      </div>
    </div>
  );
}
