import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Move, CellValue } from '../types';
import { getAIMove } from '../utils/aiPlayer';
import { trackGameStart, trackGameEnd, trackModeChange, trackScoreReset } from '../utils/analytics';

const createInitialBoard = (gridSize: number): CellValue[] => Array(gridSize * gridSize).fill(null);

const checkWinner = (board: CellValue[], gridSize: number): Player | null => {
  // Check rows
  for (let row = 0; row < gridSize; row++) {
    const firstCell = board[row * gridSize];
    if (firstCell) {
      let isWinningRow = true;
      for (let col = 1; col < gridSize; col++) {
        if (board[row * gridSize + col] !== firstCell) {
          isWinningRow = false;
          break;
        }
      }
      if (isWinningRow) return firstCell as Player;
    }
  }

  // Check columns
  for (let col = 0; col < gridSize; col++) {
    const firstCell = board[col];
    if (firstCell) {
      let isWinningCol = true;
      for (let row = 1; row < gridSize; row++) {
        if (board[row * gridSize + col] !== firstCell) {
          isWinningCol = false;
          break;
        }
      }
      if (isWinningCol) return firstCell as Player;
    }
  }

  // Check main diagonal (top-left to bottom-right)
  const firstDiagCell = board[0];
  if (firstDiagCell) {
    let isWinningDiag = true;
    for (let i = 1; i < gridSize; i++) {
      if (board[i * gridSize + i] !== firstDiagCell) {
        isWinningDiag = false;
        break;
      }
    }
    if (isWinningDiag) return firstDiagCell as Player;
  }

  // Check anti-diagonal (top-right to bottom-left)
  const firstAntiDiagCell = board[gridSize - 1];
  if (firstAntiDiagCell) {
    let isWinningAntiDiag = true;
    for (let i = 1; i < gridSize; i++) {
      if (board[i * gridSize + (gridSize - 1 - i)] !== firstAntiDiagCell) {
        isWinningAntiDiag = false;
        break;
      }
    }
    if (isWinningAntiDiag) return firstAntiDiagCell as Player;
  }

  return null;
};

const getRandomFirstPlayer = (): Player => Math.random() < 0.5 ? 'X' : 'O';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createInitialBoard(3),
    gridSize: 3,
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

  const setGridSize = useCallback((size: number) => {
    setGameState(prev => ({
      ...prev,
      gridSize: size,
      board: createInitialBoard(size),
      currentPlayer: getRandomFirstPlayer(),
      gamePhase: 'placement',
      moves: [],
      winner: null,
      nextPieceToMove: { X: 1, O: 1 }
    }));
    setSelectedPiece(null);
  }, []);

  const setGameMode = useCallback((mode: 'multiplayer' | 'singleplayer', humanPlayer: Player = 'X') => {
    trackModeChange(mode, humanPlayer);
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      humanPlayer: humanPlayer,
      board: createInitialBoard(prev.gridSize),
      currentPlayer: mode === 'singleplayer' && humanPlayer === 'O' ? 'X' : getRandomFirstPlayer(),
      gamePhase: 'placement',
      moves: [],
      winner: null,
      nextPieceToMove: { X: 1, O: 1 }
    }));
    setSelectedPiece(null);
  }, []);

  const resetGame = useCallback(() => {
    trackGameStart(gameState.gameMode, gameState.humanPlayer);
    setGameState(prev => ({
      ...prev,
      board: createInitialBoard(prev.gridSize),
      currentPlayer: prev.gameMode === 'singleplayer' && prev.humanPlayer === 'O' ? 'X' : getRandomFirstPlayer(),
      gamePhase: 'placement',
      moves: [],
      winner: null,
      nextPieceToMove: { X: 1, O: 1 }
    }));
    setSelectedPiece(null);
  }, [gameState.gameMode, gameState.humanPlayer]);

  const resetScores = useCallback(() => {
    trackScoreReset();
    setGameState(prev => ({
      ...prev,
      scores: { X: 0, O: 0 }
    }));
  }, []);

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
        const piecesPerPlayer = prev.gridSize + 1;
        const currentPlayerMoves = newState.moves.filter(m => m.player === prev.currentPlayer).length;
        if (currentPlayerMoves === piecesPerPlayer) {
          const otherPlayerMoves = newState.moves.filter(m => m.player !== prev.currentPlayer).length;
          if (otherPlayerMoves === piecesPerPlayer) {
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
          [prev.currentPlayer]: (prev.nextPieceToMove[prev.currentPlayer] % (prev.gridSize + 1)) + 1
        };
      }
      
      // Check for winner
      const winner = checkWinner(newState.board, prev.gridSize);
      if (winner) {
        trackGameEnd(winner, prev.gameMode);
        newState.winner = winner;
        newState.scores = {
          ...prev.scores,
          [winner]: prev.scores[winner] + 1
        };
      }
      return newState;
    });
  }, [gameState.winner, gameState.gameMode, gameState.currentPlayer, gameState.humanPlayer]);

  // AI move effect - separate from handleCellClick to avoid dependency issues
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
          nextPieceToMove,
          gameState.gridSize
        );
        
        // Make AI move directly without using handleCellClick
        setGameState(prev => {
          if (prev.winner) return prev;
          
          const newState = { ...prev };
          
          if (prev.gamePhase === 'placement') {
            // Placement phase
            if (prev.board[aiMoveIndex] !== null) return prev;
            
            const newBoard = [...prev.board];
            newBoard[aiMoveIndex] = prev.currentPlayer;
            
            const newMove: Move = {
              player: prev.currentPlayer,
              position: aiMoveIndex,
              moveNumber: prev.moves.filter(m => m.player === prev.currentPlayer).length + 1
            };
            
            newState.board = newBoard;
            newState.moves = [...prev.moves, newMove];
            
            // Check if we should switch to movement phase
            const piecesPerPlayer = prev.gridSize + 1;
            const currentPlayerMoves = newState.moves.filter(m => m.player === prev.currentPlayer).length;
            if (currentPlayerMoves >= piecesPerPlayer) {
              const otherPlayerMoves = newState.moves.filter(m => m.player !== prev.currentPlayer).length;
              if (otherPlayerMoves >= piecesPerPlayer) {
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
            if (prev.board[aiMoveIndex] !== null) return prev;
            
            // Move the piece to the new position
            const newBoard = [...prev.board];
            newBoard[pieceToMove] = null;
            newBoard[aiMoveIndex] = prev.currentPlayer;
            
            // Remove the old move and add it to the end with new position
            const moveToUpdate = prev.moves.find(move => 
              move.player === prev.currentPlayer && move.position === pieceToMove
            );
            
            if (moveToUpdate) {
              const newMoves = prev.moves.filter(move => 
                !(move.player === prev.currentPlayer && move.position === pieceToMove)
              );
              newMoves.push({ ...moveToUpdate, position: aiMoveIndex });
              newState.moves = newMoves;
            }
            
            newState.board = newBoard;
            newState.currentPlayer = prev.currentPlayer === 'X' ? 'O' : 'X';
            
            // Update next piece to move for this player (cycle 1->2->3->1)
            newState.nextPieceToMove = {
              ...prev.nextPieceToMove,
              [prev.currentPlayer]: (prev.nextPieceToMove[prev.currentPlayer] % (prev.gridSize + 1)) + 1
            };
          }
          
          // Check for winner
          const winner = checkWinner(newState.board, prev.gridSize);
          if (winner) {
            trackGameEnd(winner, prev.gameMode);
            newState.winner = winner;
            newState.scores = {
              ...prev.scores,
              [winner]: prev.scores[winner] + 1
            };
          }
          return newState;
        });
      }, 800); // Small delay to make AI moves visible
      
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.humanPlayer, gameState.winner, gameState.gamePhase, gameState.gridSize]);


  return {
    gameState,
    selectedPiece,
    setGridSize,
    setGameMode,
    handleCellClick,
    resetGame,
    resetScores
  };
};