import React from 'react';
import { CellValue, Player } from '../types';

interface GameCellProps {
  value: CellValue;
  onClick: () => void;
  isHighlighted: boolean;
  isNextToMove: boolean;
  disabled: boolean;
  cellIndex: number;
  moveNumber?: number;
  gridSize: number;
}

export const GameCell: React.FC<GameCellProps> = ({
  value,
  onClick,
  isHighlighted,
  isNextToMove,
  disabled,
  cellIndex,
  moveNumber,
  gridSize
}) => {
  const getCellSize = () => {
    if (gridSize <= 3) return "w-20 sm:w-24 lg:w-24";
    if (gridSize <= 5) return "w-16 sm:w-20 lg:w-20";
    if (gridSize <= 7) return "w-12 sm:w-16 lg:w-16";
    return "w-10 sm:w-12 lg:w-12";
  };

  const getTextSize = () => {
    if (gridSize <= 3) return "text-3xl sm:text-4xl lg:text-4xl";
    if (gridSize <= 5) return "text-2xl sm:text-3xl lg:text-3xl";
    if (gridSize <= 7) return "text-xl sm:text-2xl lg:text-2xl";
    return "text-lg sm:text-xl lg:text-xl";
  };

  const getMoveNumberSize = () => {
    if (gridSize <= 5) return "w-5 h-5 text-xs";
    if (gridSize <= 7) return "w-4 h-4 text-xs";
    return "w-3 h-3 text-xs";
  };

  const getCellClass = () => {
    let baseClass = `aspect-square ${getCellSize()} border-4 border-gray-800 flex items-center justify-center ${getTextSize()} font-bold cursor-pointer transition-all duration-300 transform relative `;
    
    if (disabled && !value) {
      baseClass += "cursor-not-allowed opacity-50 ";
    }
    
    if (isNextToMove) {
      baseClass += "animate-pulse ";
    } else if (isHighlighted) {
      baseClass += "ring-2 ring-blue-400 ring-offset-1 ";
    }
    
    if (!disabled && !value) {
      baseClass += "hover:bg-white/20 ";
    }
    
    if (value === 'X') {
      baseClass += "bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg ";
    } else if (value === 'O') {
      baseClass += "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg ";
    } else {
      baseClass += "bg-white hover:bg-gray-50 ";
    }
    
    return baseClass;
  };

  return (
    <div
      className={getCellClass()}
      onClick={!disabled ? onClick : undefined}
    >
      {value && (
        <span className="drop-shadow-lg">
          {value}
        </span>
      )}
      {moveNumber && (
        <span className={`absolute top-1 right-1 bg-white text-gray-800 rounded-full ${getMoveNumberSize()} flex items-center justify-center font-bold shadow-md`}>
          {moveNumber}
        </span>
      )}
    </div>
  );
};