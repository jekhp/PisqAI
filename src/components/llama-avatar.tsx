import { cn } from '@/lib/utils';

type LlamaAvatarProps = {
  status: 'idle' | 'thinking' | 'speaking';
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
          status === 'thinking' ? 'animate-pulse scale-100' : 'scale-75 opacity-0'
        )}
      />
      <svg
        viewBox="0 0 100 100"
        className={cn(
          'w-full h-full transition-transform duration-500 z-10',
          status === 'thinking' && 'scale-105'
        )}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="
            M 50,20
            C 45,20 40,25 40,30
            L 40,35
            C 30,35 25,45 25,55
            L 25,80
            C 25,85 30,90 35,90
            L 45,90
            C 50,90 50,85 50,80
            L 50,75

            M 50,75
            L 50,80
            C 50,85 55,90 60,90
            L 70,90
            C 75,90 80,85 80,80
            L 80,55
            C 80,45 75,35 65,35
            L 65,30
            C 65,25 60,20 55,20
            L 50,20
            
            M 50,20
            L 50,10
            C 45,10 42,15 45,15
            C 40,5 50,5 50,5
            C 50,5 60,5 55,15
            C 58,15 55,10 50,10

            M 40,30
            L 35,22
            
            M 65,30
            L 70,22
          "
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className={cn(
            'transition-all duration-500',
            status === 'thinking' && 'filter-[url(#glow)]',
            status === 'speaking' && 'filter-[url(#glow)]'
          )}
        />
      </svg>
      <div
        className="absolute bottom-0 w-3/4 h-1 bg-primary/20 rounded-full"
        style={{
          boxShadow: '0 0 20px 5px hsl(var(--primary) / 0.1)',
        }}
      />
    </div>
  );
}
