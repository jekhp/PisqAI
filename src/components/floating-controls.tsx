'use client';

import { useState } from 'react';
import { Mic, User } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function FloatingControls() {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-20 flex flex-col items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:bg-primary/90 focus-visible:ring-primary"
              onClick={() => setIsListening(!isListening)}
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
            <p>{isListening ? 'Stop Listening' : 'Start Listening'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white/80 hover:bg-white/20 hover:text-white"
            >
              <User className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Account</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
