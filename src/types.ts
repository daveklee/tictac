export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type GameBoard = CellValue[];

export interface Move {
  player: Player;
  position: number;
  moveNumber: number;
}

export interface GameState {
  board: GameBoard;
  gridSize: number;
  currentPlayer: Player;
  gameMode: 'multiplayer' | 'singleplayer';
  humanPlayer: Player;
  gamePhase: 'placement' | 'movement';
  moves: Move[];
  winner: Player | null;
  scores: { X: number; O: number };
  nextPieceToMove: { X: number; O: number };
  piecesPerPlayer: number;
}