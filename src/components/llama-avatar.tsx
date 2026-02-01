import Image from 'next/image';
import { cn } from '@/lib/utils';

type LlamaAvatarProps = {
  status: 'idle' | 'thinking' | 'speaking' | 'listening';
  className?: string;
};

export default function LlamaAvatar({ status, className }: LlamaAvatarProps) {
  return (
    <div
      className={cn(
        'relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center',
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-primary/10 transition-all duration-500',
          status === 'thinking' && 'animate-pulse scale-100',
          status === 'listening' && 'animate-pulse scale-110 opacity-70',
          status !== 'thinking' && status !== 'listening' && 'scale-75 opacity-0'
        )}
      />
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-300 z-10',
          (status === 'thinking' || status === 'speaking') && 'scale-105' // A slight zoom effect when active
        )}
      >
        <Image
          src="/llama.png"
          alt="Llama Avatar"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}
