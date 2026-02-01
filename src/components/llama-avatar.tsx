import { cn } from '@/lib/utils';

type LlamaAvatarProps = {
  status: 'idle' | 'thinking' | 'speaking' | 'listening';
  className?: string;
};

export default function LlamaAvatar({ status, className }: LlamaAvatarProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'speaking':
        // Anima la segunda fila de la hoja de sprites (cuadros para hablar)
        return 'animate-speak-sprite [background-position-y:-341px]';
      case 'listening':
        // Usa el tercer cuadro de la primera fila
        return '[background-position:-768px_0px]';
      case 'thinking':
        // Usa el primer cuadro de la tercera fila
        return '[background-position:0px_-682px]';
      case 'idle':
      default:
        // Usa el primer cuadro de la primera fila
        return '[background-position:0px_0px]';
    }
  };

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
          'w-[384px] h-[341px] scale-[0.6] md:scale-[0.75] origin-center bg-no-repeat',
          'transition-transform duration-500 z-10',
          (status === 'thinking' || status === 'speaking') && 'scale-[0.65] md:scale-[0.8]',
          getStatusStyles()
        )}
        style={{
          backgroundImage: 'url(/llama-sprite.png)',
          backgroundSize: '1536px 1024px',
        }}
      ></div>
    </div>
  );
}
