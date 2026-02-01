'use client';

import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type FloatingControlsProps = {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
};

export default function FloatingControls({
  isListening,
  startListening,
  stopListening,
}: FloatingControlsProps) {
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-20 flex flex-col items-center gap-4 md:bottom-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:bg-primary/90 focus-visible:ring-primary"
              onClick={handleMicClick}
            >
              <div
                className={cn(
                  'absolute inset-0 rounded-full bg-primary transition-opacity duration-300',
                  isListening ? 'animate-pulse opacity-50' : 'opacity-0'
                )}
              />
              <Mic className="w-8 h-8 z-10" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isListening ? 'Detener Escucha' : 'Iniciar Escucha'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
