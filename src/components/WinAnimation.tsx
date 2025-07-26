import React, { useEffect, useState } from 'react';
import { Player } from '../types';

interface WinAnimationProps {
  winner: Player;
  onPlayAgain: () => void;
}

export const WinAnimation: React.FC<WinAnimationProps> = ({ winner, onPlayAgain }) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; delay: number; left: number }>>([]);

  useEffect(() => {
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 2,
      left: Math.random() * 100
    }));
    setConfetti(newConfetti);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`absolute w-4 h-4 ${
            winner === 'X' 
              ? 'bg-gradient-to-br from-pink-400 to-purple-500' 
              : 'bg-gradient-to-br from-blue-400 to-cyan-500'
          } animate-bounce`}
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            animationDelay: `${piece.delay}s`,
            animationDuration: '3s'
          }}
        />
      ))}
      
      {/* Win Message */}
      <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border-4 border-gray-200 transform animate-pulse">
        <div className={`text-8xl mb-4 ${
          winner === 'X' ? 'text-purple-500' : 'text-cyan-500'
        }`}>
          🎉
        </div>
        
        <h2 className="text-4xl font-bold mb-2 text-gray-800">
          Player {winner} Wins!
        </h2>
        
        <div className={`text-6xl font-bold mb-6 ${
          winner === 'X' ? 'text-purple-500' : 'text-cyan-500'
        }`}>
          {winner}
        </div>
        
        <button
          onClick={onPlayAgain}
          className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-2xl font-bold rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg"
        >
          Play Again! 🚀
        </button>
      </div>
    </div>
  );
};