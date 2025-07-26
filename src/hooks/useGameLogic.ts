import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Move, CellValue } from '../types';
import { getAIMove } from '../utils/aiPlayer';

const initialBoard: CellValue[] = Array(9).fill(null);

const checkWinner = (board: CellValue[]): Player | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player;
    }
  }
  return null;
};

const getRandomFirstPlayer = (): Player => Math.random() < 0.5 ? 'X' : 'O';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: [...initialBoard],
    currentPlayer: getRandomFirstPlayer(),
    gameMode: 'multiplayer',
    humanPlayer: 'X',
    gamePhase: 'placement',
    moves: [],
    winner: null,
    scores: { X: 0, O: 0 },
    nextPieceToMove: { X: 1, O: 1 }
  }));

  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

  const setGameMode = useCallback((mode: 'multiplayer' | 'singleplayer', humanPlayer: Player = 'X') => {
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      humanPlayer: humanPlayer,
      board: [...initialBoard],
      currentPlayer: mode === 'singleplayer' && humanPlayer === 'O' ? 'X' : getRandomFirstPlayer(),
      gamePhase: 'placement',
      moves: [],
      winner: null,
      nextPieceToMove: { X: 1, O: 1 }
    }));
    setSelectedPiece(null);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      board: [...initialBoard],
      currentPlayer: prev.gameMode === 'singleplayer' && prev.humanPlayer === 'O' ? 'X' : getRandomFirstPlayer(),
      gamePhase: 'placement',
      moves: [],
      winner: null,
      nextPieceToMove: { X: 1, O: 1 }
    }));
    setSelectedPiece(null);
  }, []);

  const resetScores = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      scores: { X: 0, O: 0 }
    }));
  }, []);

  // AI move effect
  useEffect(() => {
    if (gameState.gameMode === 'singleplayer' && 
        gameState.currentPlayer !== gameState.humanPlayer && 
        !gameState.winner) {
      
      const timer = setTimeout(() => {
        const aiPlayer = gameState.currentPlayer;
        const nextPieceToMove = gameState.nextPieceToMove[aiPlayer];
        
        const aiMoveIndex = getAIMove(
          gameState.board,
          gameState.gamePhase,
          gameState.moves,
          aiPlayer,
          gameState.humanPlayer,
          nextPieceToMove
        );
        
        handleCellClick(aiMoveIndex);
      }, 800); // Small delay to make AI moves visible
      
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.humanPlayer, gameState.winner, gameState.board, gameState.gamePhase, gameState.moves, gameState.nextPieceToMove, handleCellClick]);

  const handleCellClick = useCallback((index: number) => {
    if (gameState.winner) return;
    
    // In single player mode, only allow human player to make moves via clicks
    if (gameState.gameMode === 'singleplayer' && gameState.currentPlayer !== gameState.humanPlayer) {
      return;
    }

    setGameState(prev => {
      const newState = { ...prev };
      
      if (prev.gamePhase === 'placement') {
        // Placement phase
        if (prev.board[index] !== null) return prev;
        
        const newBoard = [...prev.board];
        newBoard[index] = prev.currentPlayer;
        
        const newMove: Move = {
          player: prev.currentPlayer,
          position: index,
          moveNumber: prev.moves.filter(m => m.player === prev.currentPlayer).length + 1
        };
        
        newState.board = newBoard;
        newState.moves = [...prev.moves, newMove];
        
        // Check if we should switch to movement phase
        const currentPlayerMoves = newState.moves.filter(m => m.player === prev.currentPlayer).length;
        if (currentPlayerMoves === 3) {
          const otherPlayerMoves = newState.moves.filter(m => m.player !== prev.currentPlayer).length;
          if (otherPlayerMoves === 3) {
            newState.gamePhase = 'movement';
          }
        }
        
        newState.currentPlayer = prev.currentPlayer === 'X' ? 'O' : 'X';
        
      } else {
        // Movement phase
        const pieceNumberToMove = prev.nextPieceToMove[prev.currentPlayer];
        const pieceToMove = prev.moves.find(move => 
          move.player === prev.currentPlayer && move.moveNumber === pieceNumberToMove
        )?.position;
        
        if (pieceToMove === undefined) return prev;
        
        // Can't move to occupied cell
        if (prev.board[index] !== null) return prev;
        
        // Auto-move the animated piece to the clicked empty cell
        const newBoard = [...prev.board];
        newBoard[pieceToMove] = null;
        newBoard[index] = prev.currentPlayer;
        
        // Remove the old move and add it to the end with new position
        const moveToUpdate = prev.moves.find(move => 
          move.player === prev.currentPlayer && move.position === pieceToMove
        );
        
        if (moveToUpdate) {
          const newMoves = prev.moves.filter(move => 
            !(move.player === prev.currentPlayer && move.position === pieceToMove)
          );
          newMoves.push({ ...moveToUpdate, position: index });
          newState.moves = newMoves;
        }
        
        newState.board = newBoard;
        newState.currentPlayer = prev.currentPlayer === 'X' ? 'O' : 'X';
        
        // Update next piece to move for this player (cycle 1->2->3->1)
        newState.nextPieceToMove = {
          ...prev.nextPieceToMove,
          [prev.currentPlayer]: (prev.nextPieceToMove[prev.currentPlayer] % 3) + 1
        };
      }
      
      // Check for winner
      const winner = checkWinner(newState.board);
      if (winner) {
        newState.winner = winner;
        newState.scores = {
          ...prev.scores,
          [winner]: prev.scores[winner] + 1
        };
      }
      return newState;
    });
  }, [gameState.winner, selectedPiece]);

  return {
    gameState,
    selectedPiece,
    setGameMode,
    handleCellClick,
    resetGame,
    resetScores
  };
};