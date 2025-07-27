import { GameBoard, Player, Move, CellValue } from '../types';

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

const evaluateBoard = (board: CellValue[], aiPlayer: Player, gridSize: number): number => {
  const winner = checkWinner(board, gridSize);
  if (winner === aiPlayer) return 10;
  if (winner && winner !== aiPlayer) return -10;
  return 0;
};

const getAvailableMoves = (board: CellValue[]): number[] => {
  return board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
};

const minimax = (board: CellValue[], depth: number, isMaximizing: boolean, aiPlayer: Player, humanPlayer: Player, gridSize: number): number => {
  const score = evaluateBoard(board, aiPlayer, gridSize);
  
  if (score === 10) return score - depth;
  if (score === -10) return score + depth;
  
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return 0;
  
  // Limit depth based on grid size for performance
  const maxDepth = gridSize === 3 ? 6 : gridSize === 4 ? 4 : 3;
  if (depth >= maxDepth) return 0;
  
  if (isMaximizing) {
    let best = -1000;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = aiPlayer;
      const value = minimax(newBoard, depth + 1, false, aiPlayer, humanPlayer, gridSize);
      best = Math.max(best, value);
    }
    return best;
  } else {
    let best = 1000;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = humanPlayer;
      const value = minimax(newBoard, depth + 1, true, aiPlayer, humanPlayer, gridSize);
      best = Math.min(best, value);
    }
    return best;
  }
};

export const getAIMove = (
  board: CellValue[], 
  gamePhase: 'placement' | 'movement',
  moves: Move[],
  aiPlayer: Player,
  humanPlayer: Player,
  nextPieceToMove: number,
  gridSize: number
): number => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return 0;

  if (gamePhase === 'placement') {
    // Check for immediate win
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[move] = aiPlayer;
      if (checkWinner(testBoard, gridSize) === aiPlayer) {
        return move;
      }
    }
    
    // Check for blocking opponent win
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[move] = humanPlayer;
      if (checkWinner(testBoard, gridSize) === humanPlayer) {
        return move;
      }
    }
    
    // For larger grids or many moves, use simpler heuristics
    if (gridSize >= 5 || availableMoves.length > 10) {
      // Simple heuristic: prefer center, then corners, then edges
      const center = Math.floor(gridSize / 2) * gridSize + Math.floor(gridSize / 2);
      if (availableMoves.includes(center)) return center;
      
      // Try corners
      const corners = [0, gridSize - 1, gridSize * (gridSize - 1), gridSize * gridSize - 1];
      for (const corner of corners) {
        if (availableMoves.includes(corner)) return corner;
      }
      
      // Return random available move
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    // Use minimax for smaller grids
    let bestMove = availableMoves[0];
    let bestValue = -1000;
    
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[move] = aiPlayer;
      const moveValue = minimax(testBoard, 0, false, aiPlayer, humanPlayer, gridSize);
      
      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }
    
    return bestMove;
  } else {
    // Movement phase - find best destination for the piece that needs to move
    const pieceToMove = moves.find(move => 
      move.player === aiPlayer && move.moveNumber === nextPieceToMove
    )?.position;
    
    if (pieceToMove === undefined) return 0;
    
    // Check for immediate win by moving
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[pieceToMove] = null;
      testBoard[move] = aiPlayer;
      if (checkWinner(testBoard, gridSize) === aiPlayer) {
        return move;
      }
    }
    
    // For larger grids, use simple heuristics in movement phase
    if (gridSize >= 5 || availableMoves.length > 15) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    // Use minimax for smaller grids in movement phase
    let bestMove = availableMoves[0];
    let bestValue = -1000;
    
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[pieceToMove] = null;
      testBoard[move] = aiPlayer;
      const moveValue = minimax(testBoard, 0, false, aiPlayer, humanPlayer, gridSize);
      
      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
};