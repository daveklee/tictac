import { GameBoard, Player, Move, CellValue } from '../types';

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

const evaluateBoard = (board: CellValue[], aiPlayer: Player): number => {
  const winner = checkWinner(board);
  if (winner === aiPlayer) return 10;
  if (winner && winner !== aiPlayer) return -10;
  return 0;
};

const getAvailableMoves = (board: CellValue[]): number[] => {
  return board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
};

const minimax = (board: CellValue[], depth: number, isMaximizing: boolean, aiPlayer: Player, humanPlayer: Player): number => {
  const score = evaluateBoard(board, aiPlayer);
  
  if (score === 10) return score - depth;
  if (score === -10) return score + depth;
  
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return 0;
  
  if (depth > 4) return 0; // Limit depth for performance
  
  if (isMaximizing) {
    let best = -1000;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = aiPlayer;
      const value = minimax(newBoard, depth + 1, false, aiPlayer, humanPlayer);
      best = Math.max(best, value);
    }
    return best;
  } else {
    let best = 1000;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = humanPlayer;
      const value = minimax(newBoard, depth + 1, true, aiPlayer, humanPlayer);
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
  nextPieceToMove: number
): number => {
  if (gamePhase === 'placement') {
    // Placement phase - use minimax to find best empty cell
    const availableMoves = getAvailableMoves(board);
    
    // Check for immediate win
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[move] = aiPlayer;
      if (checkWinner(testBoard) === aiPlayer) {
        return move;
      }
    }
    
    // Check for blocking opponent win
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[move] = humanPlayer;
      if (checkWinner(testBoard) === humanPlayer) {
        return move;
      }
    }
    
    // Use minimax for strategic placement
    let bestMove = availableMoves[0];
    let bestValue = -1000;
    
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[move] = aiPlayer;
      const moveValue = minimax(testBoard, 0, false, aiPlayer, humanPlayer);
      
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
    
    const availableMoves = getAvailableMoves(board);
    
    // Check for immediate win by moving
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[pieceToMove] = null;
      testBoard[move] = aiPlayer;
      if (checkWinner(testBoard) === aiPlayer) {
        return move;
      }
    }
    
    // Check for blocking opponent win
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[pieceToMove] = null;
      testBoard[move] = aiPlayer;
      
      // Simulate opponent's best response
      const opponentMoves = getAvailableMoves(testBoard);
      let wouldLose = false;
      
      for (const opponentMove of opponentMoves) {
        const opponentBoard = [...testBoard];
        opponentBoard[opponentMove] = humanPlayer;
        if (checkWinner(opponentBoard) === humanPlayer) {
          wouldLose = true;
          break;
        }
      }
      
      if (!wouldLose) {
        return move;
      }
    }
    
    // Use minimax for strategic movement
    let bestMove = availableMoves[0];
    let bestValue = -1000;
    
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[pieceToMove] = null;
      testBoard[move] = aiPlayer;
      const moveValue = minimax(testBoard, 0, false, aiPlayer, humanPlayer);
      
      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
};