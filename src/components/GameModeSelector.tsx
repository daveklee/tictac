import React from 'react';
import { Player } from '../types';
import { User, Users, Bot } from 'lucide-react';

interface GameModeSelectorProps {
  gameMode: 'multiplayer' | 'singleplayer';
  humanPlayer: Player;
  onModeChange: (mode: 'multiplayer' | 'singleplayer', humanPlayer?: Player) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  gameMode,
  humanPlayer,
  onModeChange
}) => {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border-2 border-gray-200 mb-3 sm:mb-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={() => onModeChange('multiplayer')}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
            gameMode === 'multiplayer'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users size={16} />
          2 Players
        </button>
        
        <button
          onClick={() => onModeChange('singleplayer', 'X')}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
            gameMode === 'singleplayer' && humanPlayer === 'X'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <User size={16} />
          vs AI (You: X)
        </button>
        
        <button
          onClick={() => onModeChange('singleplayer', 'O')}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
            gameMode === 'singleplayer' && humanPlayer === 'O'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Bot size={16} />
          vs AI (You: O)
        </button>
      </div>
    </div>
  );
};