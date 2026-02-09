'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChessBoard, PlusCircle, Undo, Lightbulb, Bot, Info, History, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ChessGameProps = {
  onExit: () => void;
  speak: (text: string) => Promise<void>;
};

type Square = { row: number; col: number };
type Move = { from: Square; to: Square; piece: string; captured: string | null };

// Helper functions (outside component to avoid recreation on renders)
function getPieceSymbol(piece: string): string {
    const symbols: { [key: string]: string } = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return symbols[piece] || '';
}

function formatMove(move: Move): string {
    const fromSquare = `${String.fromCharCode(97 + move.from.col)}${8 - move.from.row}`;
    const toSquare = `${String.fromCharCode(97 + move.to.col)}${8 - move.to.row}`;
    return `pieza de ${fromSquare} a ${toSquare}`;
}

const pieceValues: { [key: string]: number } = {
    'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900,
    'P': -10, 'N': -30, 'B': -30, 'R': -50, 'Q': -90, 'K': -900
};

export default function ChessGame({ onExit, speak }: ChessGameProps) {
    const [board, setBoard] = useState<string[][]>([]);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [validMoves, setValidMoves] = useState<Square[]>([]);
    const [turn, setTurn] = useState<'white' | 'black'>('white');
    const [gameOver, setGameOver] = useState(false);
    const [status, setStatus] = useState('Turno de las blancas. ¡Empieza a jugar!');
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [lastMove, setLastMove] = useState<Move | null>(null);
    const [botDifficulty, setBotDifficulty] = useState(3);
    const [isBotThinking, setIsBotThinking] = useState(false);
    
    const getValidMovesForPiece = useCallback((row: number, col: number, currentBoard: string[][]): Square[] => {
        const piece = currentBoard[row][col];
        const moves: Square[] = [];
        if (!piece) return moves;
        const isWhite = piece === piece.toUpperCase();

        const addLinearMoves = (directions: number[][]) => {
            for (const [dr, dc] of directions) {
                let newRow = row + dr;
                let newCol = col + dc;
                while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    if (!currentBoard[newRow][newCol]) {
                        moves.push({ row: newRow, col: newCol });
                    } else {
                        if ((isWhite && currentBoard[newRow][newCol] === currentBoard[newRow][newCol].toLowerCase()) ||
                            (!isWhite && currentBoard[newRow][newCol] === currentBoard[newRow][newCol].toUpperCase())) {
                            moves.push({ row: newRow, col: newCol });
                        }
                        break;
                    }
                    newRow += dr;
                    newCol += dc;
                }
            }
        };

        switch (piece.toLowerCase()) {
            case 'p':
                const direction = isWhite ? -1 : 1;
                const startRow = isWhite ? 6 : 1;
                if (currentBoard[row + direction] && !currentBoard[row + direction][col]) {
                    moves.push({ row: row + direction, col });
                    if (row === startRow && !currentBoard[row + 2 * direction][col]) {
                        moves.push({ row: row + 2 * direction, col });
                    }
                }
                for (const dc of [-1, 1]) {
                    const newCol = col + dc;
                    if (newCol >= 0 && newCol < 8 && currentBoard[row + direction]?.[newCol]) {
                        const targetPiece = currentBoard[row + direction][newCol];
                        if ((isWhite && targetPiece === targetPiece.toLowerCase()) || (!isWhite && targetPiece === targetPiece.toUpperCase())) {
                            moves.push({ row: row + direction, col: newCol });
                        }
                    }
                }
                break;
            case 'r':
                addLinearMoves([[1, 0], [-1, 0], [0, 1], [0, -1]]);
                break;
            case 'n':
                const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
                for (const [dr, dc] of knightMoves) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const targetPiece = currentBoard[newRow][newCol];
                        if (!targetPiece || (isWhite && targetPiece === targetPiece.toLowerCase()) || (!isWhite && targetPiece === targetPiece.toUpperCase())) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    }
                }
                break;
            case 'b':
                addLinearMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
                break;
            case 'q':
                addLinearMoves([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
                break;
            case 'k':
                for (const dr of [-1, 0, 1]) {
                    for (const dc of [-1, 0, 1]) {
                        if (dr === 0 && dc === 0) continue;
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                            const targetPiece = currentBoard[newRow][newCol];
                            if (!targetPiece || (isWhite && targetPiece === targetPiece.toLowerCase()) || (!isWhite && targetPiece === targetPiece.toUpperCase())) {
                                moves.push({ row: newRow, col: newCol });
                            }
                        }
                    }
                }
                break;
        }
        return moves;
    }, []);

    const makeMove = useCallback((from: Square, to: Square, currentBoard: string[][]) => {
        const newBoard = currentBoard.map(r => [...r]);
        const piece = newBoard[from.row][from.col];
        const captured = newBoard[to.row][to.col];
        
        const move: Move = { from, to, piece, captured };
        setMoveHistory(prev => [...prev, move]);

        newBoard[to.row][to.col] = piece;
        newBoard[from.row][from.col] = '';

        if (piece.toLowerCase() === 'p' && (to.row === 0 || to.row === 7)) {
            newBoard[to.row][to.col] = piece === 'P' ? 'Q' : 'q';
        }

        setBoard(newBoard);
        setLastMove(move);
        setTurn(prev => prev === 'white' ? 'black' : 'white');

        // Simplified game over check
        const kings = newBoard.flat().filter(p => p.toLowerCase() === 'k');
        if (kings.length < 2) {
            setGameOver(true);
            setStatus(`¡Jaque mate! Ganaron las ${turn === 'white' ? 'Negras' : 'Blancas'}.`);
        } else {
             setStatus(`Turno de las ${turn === 'white' ? 'negras' : 'blancas'}.`);
        }
    }, [turn]);

    const handleSquareClick = useCallback((row: number, col: number) => {
        if (gameOver || turn === 'black') return;

        if (selectedSquare) {
            const isMoveValid = validMoves.some(move => move.row === row && move.col === col);
            if (isMoveValid) {
                makeMove(selectedSquare, { row, col }, board);
                setSelectedSquare(null);
                setValidMoves([]);
            } else {
                const piece = board[row][col];
                if (piece && piece === piece.toUpperCase()) {
                    setSelectedSquare({ row, col });
                    setValidMoves(getValidMovesForPiece(row, col, board));
                } else {
                    setSelectedSquare(null);
                    setValidMoves([]);
                }
            }
        } else {
            const piece = board[row][col];
            if (piece && piece === piece.toUpperCase()) {
                setSelectedSquare({ row, col });
                setValidMoves(getValidMovesForPiece(row, col, board));
            }
        }
    }, [gameOver, turn, selectedSquare, validMoves, board, makeMove, getValidMovesForPiece]);

    const evaluateBoard = (currentBoard: string[][]) => {
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = currentBoard[r][c];
                if (piece) {
                    score += pieceValues[piece] || 0;
                }
            }
        }
        return score;
    };

    const minimax = useCallback((currentBoard: string[][], depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
        if (depth === 0) {
            return evaluateBoard(currentBoard);
        }

        const player = isMaximizing ? 'black' : 'white';
        const isBlack = player === 'black';
        
        let allMoves: Move[] = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = currentBoard[r][c];
                if (piece && ((isBlack && piece === piece.toLowerCase()) || (!isBlack && piece === piece.toUpperCase()))) {
                    const pieceMoves = getValidMovesForPiece(r, c, currentBoard);
                    pieceMoves.forEach(move => allMoves.push({ from: { row: r, col: c }, to: move, piece: '', captured: null }));
                }
            }
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of allMoves) {
                const newBoard = currentBoard.map(r => [...r]);
                const piece = newBoard[move.from.row][move.from.col];
                newBoard[move.to.row][move.to.col] = piece;
                newBoard[move.from.row][move.from.col] = '';
                
                const evalValue = minimax(newBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evalValue);
                alpha = Math.max(alpha, evalValue);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of allMoves) {
                const newBoard = currentBoard.map(r => [...r]);
                const piece = newBoard[move.from.row][move.from.col];
                newBoard[move.to.row][move.to.col] = piece;
                newBoard[move.from.row][move.from.col] = '';

                const evalValue = minimax(newBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evalValue);
                beta = Math.min(beta, evalValue);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }, [getValidMovesForPiece]);

    const getBestMove = useCallback((currentBoard: string[][]): Move | null => {
        let bestMove: Move | null = null;
        let bestValue = -Infinity;

        let allMoves: Move[] = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = currentBoard[r][c];
                if (piece && piece === piece.toLowerCase()) { // Black pieces
                    const pieceMoves = getValidMovesForPiece(r, c, currentBoard);
                    pieceMoves.forEach(move => allMoves.push({ from: { row: r, col: c }, to: move, piece: '', captured: null }));
                }
            }
        }

        if (allMoves.length === 0) return null;

        for (const move of allMoves) {
            const newBoard = currentBoard.map(r => [...r]);
            const piece = newBoard[move.from.row][move.from.col];
            newBoard[move.to.row][move.to.col] = piece;
            newBoard[move.from.row][move.from.col] = '';

            const moveValue = minimax(newBoard, botDifficulty - 1, -Infinity, Infinity, false);

            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }
        return bestMove;

    }, [botDifficulty, getValidMovesForPiece, minimax]);

    const makeBotMove = useCallback(async () => {
        if (gameOver) return;
        setIsBotThinking(true);
        setStatus('El bot está pensando...');
        await new Promise(resolve => setTimeout(resolve, 500));

        const bestMove = getBestMove(board);

        if (bestMove) {
            const pieceToMove = board[bestMove.from.row][bestMove.from.col];
            const capturedPiece = board[bestMove.to.row][bestMove.to.col];
            const toSquare = `${String.fromCharCode(97 + bestMove.to.col)}${8 - bestMove.to.row}`;

            const pieceNames: { [key: string]: string } = {
                'p': 'peón', 'n': 'caballo', 'b': 'alfil', 'r': 'torre', 'q': 'reina', 'k': 'rey'
            };

            const pieceName = pieceNames[pieceToMove.toLowerCase()];
            
            let narration = '';
            if (capturedPiece) {
                const capturedPieceName = pieceNames[capturedPiece.toLowerCase()];
                const phrases = [
                    `Mi ${pieceName} captura tu ${capturedPieceName} en ${toSquare}.`,
                    `Con mi ${pieceName}, digo adiós a tu ${capturedPieceName}.`,
                    `Tu ${capturedPieceName} se ha encontrado con mi ${pieceName}. ¡A ver qué haces ahora!`,
                ];
                narration = phrases[Math.floor(Math.random() * phrases.length)];
            } else {
                 const phrases = [
                    `Muevo mi ${pieceName} a ${toSquare}.`,
                    `Mi ${pieceName} avanza a ${toSquare}.`,
                    `Coloco mi ${pieceName} en ${toSquare}. ¿Qué te parece?`,
                ];
                narration = phrases[Math.floor(Math.random() * phrases.length)];
            }
            
            await speak(narration);
            makeMove(bestMove.from, bestMove.to, board);
        } else {
             setStatus('¡No tengo movimientos! Creo que ganaste.');
             setGameOver(true);
        }
        setIsBotThinking(false);
    }, [board, gameOver, getBestMove, makeMove, speak]);

    const initBoard = useCallback(() => {
        setBoard([
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ]);
        setSelectedSquare(null);
        setValidMoves([]);
        setTurn('white');
        setGameOver(false);
        setMoveHistory([]);
        setLastMove(null);
        setStatus('Turno de las blancas. ¡Empieza a jugar!');
    }, []);

    useEffect(() => {
        initBoard();
    }, [initBoard]);

    useEffect(() => {
        if (turn === 'black' && !gameOver) {
            makeBotMove();
        }
    }, [turn, gameOver, makeBotMove]);

    const undoMove = () => {
        if(isBotThinking || moveHistory.length === 0) return;

        // Undo player's move and bot's move
        const lastPlayerMove = moveHistory[moveHistory.length - 2] || moveHistory[moveHistory.length - 1];
        
        let boardAfterUndo = [...board];

        for (let i = 0; i < (moveHistory.length >= 2 ? 2 : 1); i++) {
            const lastM = moveHistory[moveHistory.length - (i+1)];
            const newBoard = boardAfterUndo.map(r => [...r]);
            newBoard[lastM.from.row][lastM.from.col] = lastM.piece;
            newBoard[lastM.to.row][lastM.to.col] = lastM.captured || '';
            boardAfterUndo = newBoard;
        }

        setBoard(boardAfterUndo);
        setMoveHistory(prev => prev.slice(0, prev.length - (moveHistory.length >= 2 ? 2 : 1)));
        setLastMove(moveHistory[moveHistory.length - 3] || null);
        setTurn('white');
        setGameOver(false);
        setStatus('Turno de las blancas.');
        setSelectedSquare(null);
        setValidMoves([]);
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row items-center md:items-start justify-center gap-4 lg:gap-8 p-2 overflow-auto">
            {/* Game Section */}
            <div className="flex-shrink-0 w-full max-w-lg md:max-w-md lg:max-w-lg bg-background/30 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl">
                <div className="grid grid-cols-8 aspect-square border-2 border-stone-700 rounded-md overflow-hidden">
                    {board.map((row, r_idx) => (
                        row.map((piece, c_idx) => {
                            const isLight = (r_idx + c_idx) % 2 === 0;
                            const isSelected = selectedSquare?.row === r_idx && selectedSquare?.col === c_idx;
                            const isValidMove = validMoves.some(m => m.row === r_idx && m.col === c_idx);
                            const isLastMove = (lastMove?.from.row === r_idx && lastMove?.from.col === c_idx) || (lastMove?.to.row === r_idx && lastMove?.to.col === c_idx);

                            return (
                                <div 
                                    key={`${r_idx}-${c_idx}`}
                                    className={cn(
                                        "flex items-center justify-center relative cursor-pointer select-none",
                                        isLight ? 'bg-stone-200' : 'bg-stone-500',
                                        isSelected && 'bg-yellow-400/60',
                                        isValidMove && 'bg-green-500/40',
                                        isLastMove && 'bg-orange-400/40'
                                    )}
                                    onClick={() => handleSquareClick(r_idx, c_idx)}
                                >
                                    {piece && (
                                        <span className={cn("text-4xl md:text-5xl", piece === piece.toUpperCase() ? 'text-white [text-shadow:_1px_1px_3px_#000]' : 'text-black [text-shadow:_1px_1px_3px_#666]')}>
                                            {getPieceSymbol(piece)}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    ))}
                </div>
                 <div className="bg-slate-800/80 rounded-lg p-3 mt-4 text-center text-lg font-bold border-l-4 border-primary">
                    {status}
                </div>
                 <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    <Button onClick={initBoard} disabled={isBotThinking}><PlusCircle/>Nuevo Juego</Button>
                    <Button onClick={undoMove} variant="secondary" disabled={isBotThinking || moveHistory.length === 0}><Undo/>Deshacer</Button>
                    <Button onClick={onExit} variant="destructive"><X/>Salir</Button>
                </div>
            </div>

            {/* Info Section */}
            <div className="w-full max-w-lg md:max-w-xs flex flex-col gap-4">
                <div className="bg-background/30 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-primary border-b-2 border-border pb-2 mb-2"><Info/>Información</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Turno:</span><span>{turn === 'white' ? 'Blancas' : 'Negras'}</span></div>
                        <div className="flex justify-between"><span>Estado:</span><span>{gameOver ? 'Terminado' : 'En juego'}</span></div>
                        <div className="flex justify-between"><span>Jugadas:</span><span>{moveHistory.length}</span></div>
                    </div>
                </div>

                <div className="bg-background/30 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl">
                     <h3 className="flex items-center gap-2 text-lg font-bold text-primary border-b-2 border-border pb-2 mb-2"><SlidersHorizontal/>Dificultad</h3>
                     <div className="flex flex-col gap-2 mt-2">
                        {[
                            { label: 'Fácil (Profundidad 2)', level: 2 },
                            { label: 'Intermedio (Profundidad 3)', level: 3 },
                            { label: 'Difícil (Profundidad 4)', level: 4 },
                        ].map(({label, level}) => (
                             <Button 
                                key={level}
                                variant={botDifficulty === level ? "default" : "secondary"}
                                onClick={() => setBotDifficulty(level)}
                                className="w-full justify-start"
                             >
                                {label}
                            </Button>
                        ))}
                     </div>
                </div>

                <div className="bg-background/30 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl flex-grow flex flex-col min-h-0">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-primary border-b-2 border-border pb-2 mb-2"><History/>Historial</h3>
                    <div className="overflow-y-auto flex-grow pr-2">
                        <ol className="space-y-1 text-xs list-decimal list-inside">
                            {moveHistory.filter((_, i) => i % 2 === 0).map((move, index) => (
                                <li key={index} className="grid grid-cols-2 gap-2 font-mono">
                                    <span>{formatMove(move)}</span>
                                    <span>{moveHistory[index * 2 + 1] ? formatMove(moveHistory[index * 2 + 1]) : '...'}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
