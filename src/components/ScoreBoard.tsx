import React from 'react';
import { Player } from '../types';

interface ScoreBoardProps {
  scores: { X: number; O: number };
  onReset: () => void;
  currentPlayer: Player;
  gamePhase: 'placement' | 'movement';
  nextMoveNumber: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  scores,
  onReset,
  currentPlayer,
  gamePhase,
  nextMoveNumber
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border-4 border-gray-200 w-full max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Score</h2>
        <button
          onClick={onReset}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-400 to-pink-500 text-white text-sm sm:text-base rounded-lg font-semibold hover:scale-105 transition-transform duration-200 shadow-lg"
        >
          Reset
        </button>
      </div>
      
      <div className="flex justify-between gap-3 mb-4">
        <div className={`flex-1 p-3 sm:p-4 rounded-xl text-center transition-all duration-300 ${
          currentPlayer === 'X' ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white scale-105 shadow-lg' : 'bg-gray-100 text-gray-700'
        }`}>
          <div className="text-2xl sm:text-3xl font-bold">X</div>
          <div className="text-xl sm:text-2xl font-bold">{scores.X}</div>
        </div>
        
        <div className={`flex-1 p-3 sm:p-4 rounded-xl text-center transition-all duration-300 ${
          currentPlayer === 'O' ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white scale-105 shadow-lg' : 'bg-gray-100 text-gray-700'
        }`}>
          <div className="text-2xl sm:text-3xl font-bold">O</div>
          <div className="text-xl sm:text-2xl font-bold">{scores.O}</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${
          currentPlayer === 'X' ? 'text-purple-600' : 'text-cyan-600'
        }`}>
          {currentPlayer}'s Turn
        </div>
        
        {gamePhase === 'placement' ? (
          <div className="text-xs sm:text-sm text-gray-600">
            Place your piece anywhere
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-gray-600">
            Move your <span className="font-bold">#{nextMoveNumber}</span> piece
          </div>
        )}
      </div>
    </div>
  );
};