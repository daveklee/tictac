import React from 'react';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { WinAnimation } from './components/WinAnimation';
import { useGameLogic } from './hooks/useGameLogic';

function App() {
  const { gameState, selectedPiece, handleCellClick, resetGame, resetScores } = useGameLogic();

  const getNextMoveNumber = () => {
    if (gameState.gamePhase === 'placement') {
      const playerMoves = gameState.moves.filter(move => move.player === gameState.currentPlayer);
      return playerMoves.length + 1;
    } else {
      // In movement phase, return which piece number needs to be moved
      return gameState.nextPieceToMove[gameState.currentPlayer];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-500 p-4 flex flex-col items-center justify-center">
      <div className="mb-4 sm:mb-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
          Moving Tic-Tac-Toe! 🎮
        </h1>
        <p className="text-sm sm:text-lg text-white/90 max-w-2xl mx-auto leading-snug px-2">
          Get 3 in a row to win! After placing 3 pieces, you must move your oldest piece each turn.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start">
        <GameBoard
          board={gameState.board}
          onCellClick={handleCellClick}
          currentPlayer={gameState.currentPlayer}
          gamePhase={gameState.gamePhase}
          moves={gameState.moves}
          selectedPiece={selectedPiece}
          nextPieceToMove={gameState.nextPieceToMove}
        />
        
        <ScoreBoard
          scores={gameState.scores}
          onReset={resetScores}
          currentPlayer={gameState.currentPlayer}
          gamePhase={gameState.gamePhase}
          nextMoveNumber={getNextMoveNumber()}
        />
      </div>

      <div className="mt-4 sm:mt-6">
        <button
          onClick={resetGame}
          className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-lg sm:text-xl font-bold rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg"
        >
          New Game 🎲
        </button>
      </div>

      {gameState.winner && (
        <WinAnimation winner={gameState.winner} onPlayAgain={resetGame} />
      )}
    </div>
  );
}

export default App;