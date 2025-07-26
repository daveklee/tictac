import React from 'react';
import { GameCell } from './GameCell';
import { GameBoard as GameBoardType, Player, Move } from '../types';

interface GameBoardProps {
  board: GameBoardType;
  onCellClick: (index: number) => void;
  currentPlayer: Player;
  gamePhase: 'placement' | 'movement';
  moves: Move[];
  selectedPiece: number | null;
  nextPieceToMove: { X: number; O: number };
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onCellClick,
  currentPlayer,
  gamePhase,
  moves,
  selectedPiece,
  nextPieceToMove
}) => {
  const getNextMoveToMove = () => {
    if (gamePhase !== 'movement') return null;
    
    // Get the piece number that should be moved next for current player
    const pieceNumberToMove = nextPieceToMove[currentPlayer];
    
    // Find the position of that piece
    const moveToMove = moves.find(move => 
      move.player === currentPlayer && move.moveNumber === pieceNumberToMove
    );
    
    return moveToMove?.position ?? null;
  };

  const getMoveNumber = (position: number): number | undefined => {
    const move = moves.find(m => m.position === position);
    return move?.moveNumber;
  };

  const pieceToMovePosition = getNextMoveToMove();

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl border-4 border-gray-300 w-fit mx-auto min-w-fit">
      <div className="grid grid-cols-3 gap-1 sm:gap-1.5 lg:gap-2 bg-gray-800 p-2 sm:p-2 lg:p-3 rounded-xl">
        {board.map((cell, index) => (
          <GameCell
            key={index}
            value={cell}
            onClick={() => onCellClick(index)}
            isHighlighted={selectedPiece === index}
            isNextToMove={pieceToMovePosition === index}
            disabled={false}
            cellIndex={index}
            moveNumber={getMoveNumber(index)}
          />
        ))}
      </div>
      
    </div>
  );
};