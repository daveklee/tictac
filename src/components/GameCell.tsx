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
}

export const GameCell: React.FC<GameCellProps> = ({
  value,
  onClick,
  isHighlighted,
  isNextToMove,
  disabled,
  cellIndex,
  moveNumber
}) => {
  const getCellClass = () => {
    let baseClass = "aspect-square w-20 sm:w-24 lg:w-24 xl:w-28 border-4 border-gray-800 flex items-center justify-center text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold cursor-pointer transition-all duration-300 transform relative ";
    
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
        <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 lg:top-1 lg:right-1 xl:top-1.5 xl:right-1.5 text-xs sm:text-sm lg:text-xs xl:text-sm bg-white text-gray-800 rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 flex items-center justify-center font-bold shadow-md">
          {moveNumber}
        </span>
      )}
    </div>
  );
};