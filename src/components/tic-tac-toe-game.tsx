'use client';

import { useState, useEffect, useCallback } from 'react';
import { Circle, X as XIcon, RotateCw, X as ExitIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LlamaAvatar from './llama-avatar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Player = 'X' | 'O';
type SquareValue = Player | null;

type TicTacToeGameProps = {
  onExit: () => void;
  speak: (text: string) => Promise<void>;
};

const WinningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

const TicTacToeGame = ({ onExit, speak }: TicTacToeGameProps) => {
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const [winner, setWinner] = useState<SquareValue | 'draw'>(null);
  const [status, setStatus] = useState('¡Tu turno! Coloca tu X.');
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = useCallback((currentBoard: SquareValue[]): { winner: SquareValue | 'draw' | null, line: number[] | null } => {
    for (const combo of WinningCombos) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    if (currentBoard.every(square => square !== null)) {
      return { winner: 'draw', line: null };
    }
    return { winner: null, line: null };
  }, []);

  const handlePlayerMove = (index: number) => {
    if (board[index] || winner || turn !== 'X') return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setTurn('O');
  };

  const botMove = useCallback((currentBoard: SquareValue[]) => {
    const newBoard = [...currentBoard];
    let moveIndex: number | null = null;
    
    // Create a function to check for a winning move for a given player
    const findWinningMove = (player: Player): number | null => {
        for (let i = 0; i < 9; i++) {
            if (!newBoard[i]) {
                const tempBoard = [...newBoard];
                tempBoard[i] = player;
                if (checkWinner(tempBoard).winner === player) {
                    return i;
                }
            }
        }
        return null;
    };

    // 1. Check if bot can win
    moveIndex = findWinningMove('O');
    if (moveIndex !== null) {
      newBoard[moveIndex] = 'O';
      setBoard(newBoard);
      return moveIndex;
    }

    // 2. Check if player can win and block
    moveIndex = findWinningMove('X');
    if (moveIndex !== null) {
      newBoard[moveIndex] = 'O';
      setBoard(newBoard);
      return moveIndex;
    }
    
    // 3. Take center if available
    if (!newBoard[4]) {
      moveIndex = 4;
      newBoard[moveIndex] = 'O';
      setBoard(newBoard);
      return moveIndex;
    }

    // 4. Take a corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !newBoard[i]);
    if (availableCorners.length > 0) {
      moveIndex = availableCorners[Math.floor(Math.random() * availableCorners.length)];
      newBoard[moveIndex] = 'O';
      setBoard(newBoard);
      return moveIndex;
    }

    // 5. Take any available square
    const availableSquares = newBoard.map((val, idx) => val === null ? idx : -1).filter(idx => idx !== -1);
    if(availableSquares.length > 0) {
        moveIndex = availableSquares[Math.floor(Math.random() * availableSquares.length)];
        newBoard[moveIndex] = 'O';
        setBoard(newBoard);
        return moveIndex;
    }

    return null;
  }, [checkWinner]);

  useEffect(() => {
    const { winner: gameWinner, line } = checkWinner(board);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      if (gameWinner === 'draw') {
        setStatus('¡Es un empate!');
        speak('¡Vaya, un empate! Bien jugado.');
      } else {
        const winnerText = gameWinner === 'X' ? '¡Ganaste!' : '¡Gané yo!';
        const winnerSpeech = gameWinner === 'X' ? '¡Felicidades, me has ganado!' : '¡He ganado! Inténtalo de nuevo.';
        setStatus(winnerText);
        speak(winnerSpeech);
      }
    } else if (turn === 'O') {
      setStatus('Estoy pensando...');
      setTimeout(() => {
        const moveIndex = botMove(board);
        if (moveIndex !== null) {
            const row = Math.floor(moveIndex / 3) + 1;
            const col = (moveIndex % 3) + 1;
            speak(`Pongo mi círculo en la fila ${row}, columna ${col}.`);
        }
        setTurn('X');
      }, 700);
    } else if (turn === 'X') {
      setStatus('¡Tu turno! Coloca tu X.');
    }
  }, [board, turn, checkWinner, botMove, speak]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    setStatus('¡Tu turno! Coloca tu X.');
    setWinningLine(null);
    speak("¡Nuevo juego! ¡A ver si puedes ganarme esta vez!");
  };

  const Square = ({ index }: { index: number }) => {
    const value = board[index];
    const isWinning = winningLine?.includes(index);
    return (
      <button
        onClick={() => handlePlayerMove(index)}
        disabled={!!value || !!winner}
        className={cn(
          "w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center border-2 border-border transition-colors duration-300",
          "disabled:cursor-not-allowed",
          value === 'X' ? 'text-primary' : 'text-accent',
          isWinning ? 'bg-primary/20' : 'hover:bg-muted/50'
        )}
      >
        {value === 'X' && <XIcon className="w-16 h-16 sm:w-24 sm:h-24 stroke-[3]" />}
        {value === 'O' && <Circle className="w-14 h-14 sm:w-20 sm:h-20 stroke-[3]" />}
      </button>
    );
  };
  
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 lg:gap-8 mt-4 px-4">
      <div className="w-full max-w-[200px] md:max-w-[250px] flex-shrink-0">
          <LlamaAvatar status={turn === 'O' && !winner ? 'thinking' : 'idle'} />
      </div>
      <Card className="w-full max-w-md bg-background/30 backdrop-blur-sm border-border shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-primary">
            Tres en Raya
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-3 grid-rows-3 bg-background rounded-lg overflow-hidden">
            {Array(9).fill(null).map((_, i) => (
              <Square key={i} index={i} />
            ))}
          </div>
          <div className="bg-slate-800/80 rounded-lg p-3 mt-2 text-center text-lg font-bold border-l-4 border-primary w-full">
            {status}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={resetGame} variant="secondary">
            <RotateCw className="mr-2" /> Reiniciar
          </Button>
          <Button onClick={onExit} variant="destructive">
            <ExitIcon className="mr-2" /> Salir
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TicTacToeGame;
