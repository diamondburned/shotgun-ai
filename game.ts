// GameState determines the state of the game for the current move.
// It is used by the AI to predict the next move.
export class GameState {
  myBulletsLoaded: number;
  myShieldsRemaining: number;
  myKnifeOut: boolean;
  opponentBulletsLoaded: number;
  opponentShieldsRemaining: number;
  opponentKnifeOut: boolean;
  turnCount: number;
}

// Move is an enum of all possible moves.
export enum Move {
  Reload = "reload",
  Shoot = "shoot",
  Block = "block",
  TakeOutKnife = "takeOutKnife",
  Stab = "stab",
}
