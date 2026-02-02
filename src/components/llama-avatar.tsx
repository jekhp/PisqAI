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
      {/* Bottom Glow Effect */}
      <div
        className={cn(
          'absolute bottom-[15%] w-[150%] h-[70%] bg-primary/10 blur-3xl rounded-[50%] transition-all duration-500',
          'after:absolute after:inset-0 after:bg-accent/10 after:rounded-[50%] after:-translate-x-8',
          (status === 'listening' || status === 'speaking' || status === 'thinking')
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-75'
        )}
      />

      {/* Pulse effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-primary/5 transition-all duration-500',
          status === 'thinking' && 'animate-pulse scale-100',
          status === 'listening' && 'animate-pulse scale-110 opacity-70',
          status !== 'thinking' && status !== 'listening' && 'scale-75 opacity-0'
        )}
      />

      {/* Fire Animation - Behind the Llama */}
      <FireAnimation
        isSpeaking={status === 'speaking'}
        className="bottom-[-20%] md:bottom-[-25%] z-0"
      />

      {/* Llama Image */}
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-300 z-10',
          (status === 'thinking' || status === 'speaking') && 'scale-105'
        )}
      >
        <Image
          src="/llama.png"
          alt="Llama Avatar"
          fill
          sizes="(max-width: 768px) 16rem, 24rem"
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
}
