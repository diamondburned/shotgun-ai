// Move is an enum of all possible moves.
export enum Move {
  Reload = "reload",
  Shoot = "shoot",
  Block = "block",
  TakeOutKnife = "takeOutKnife",
  Stab = "stab",
}

export interface Player {
  // play asks the player to make a move. It blocks until the player makes a
  // move.
  play(): Promise<Move>;
  // update is called after the opponent makes a move. It is called with the
  // player's state, the opponent's state, and the turn number.
  update(me: PlayerState, opponent: PlayerState, turn: number, lastMove: Move): void;
}

export enum Outcome {
  Continue = "continue",
  Draw = "draw",
  Player1Wins = "player1Wins",
  Player2Wins = "player2Wins",
  IllegalMove = "illegalMove",
}

export class PlayerState {
  bulletsLoaded = 0;
  shieldsRemaining = 9;
  knifeOut = false;

  static with(obj: {
    bulletsLoaded: number;
    shieldsRemaining: number;
    knifeOut: boolean;
  }): PlayerState {
    const state = new PlayerState();
    state.bulletsLoaded = obj.bulletsLoaded;
    state.shieldsRemaining = obj.shieldsRemaining;
    state.knifeOut = obj.knifeOut;
    return state;
  }

  constructor() {}

  // isLegal returns true if the given move is legal.
  isLegal(move: Move): boolean {
    switch (move) {
      case Move.Reload:
        return this.canReload;
      case Move.Shoot:
        return this.canShoot;
      case Move.Block:
        return this.canBlock;
      case Move.TakeOutKnife:
        return this.canTakeOutKnife;
      case Move.Stab:
        return this.canStab;
    }
  }

  // update updates the player's state based on the move they made.
  // If the move is illegal, it returns false.
  update(move: Move): boolean {
    if (!this.isLegal(move)) {
      return false;
    }
    switch (move) {
      case Move.Reload:
        this.bulletsLoaded++;
        break;
      case Move.Block:
        this.shieldsRemaining--;
        break;
      case Move.Shoot:
        this.bulletsLoaded--;
        break;
      case Move.TakeOutKnife:
        this.knifeOut = true;
        break;
    }
    return true;
  }

  get canReload(): boolean {
    return true;
  }

  get canStab(): boolean {
    return this.knifeOut;
  }

  get canShoot(): boolean {
    return this.bulletsLoaded > 0;
  }

  get canBlock(): boolean {
    return this.shieldsRemaining > 0;
  }

  get canTakeOutKnife(): boolean {
    return !this.knifeOut;
  }
}

// moveKillsOpponent returns true if the player kills the opponent with the
// given move.
function moveKillsOpponent(playerMove: Move, opponentMove: Move): boolean {
  switch (playerMove) {
    case Move.Reload:
    case Move.Block:
    case Move.TakeOutKnife:
      return false;
    case Move.Shoot:
      return opponentMove != Move.Block;
    case Move.Stab:
      return opponentMove != Move.Block && opponentMove != Move.Shoot;
  }
}

function calculateOutcome(p1Move: Move, p2Move: Move): Outcome {
  const p1Kills = moveKillsOpponent(p1Move, p2Move);
  const p2Kills = moveKillsOpponent(p2Move, p1Move);

  if (p1Kills && p2Kills) {
    return Outcome.Draw;
  }

  if (p1Kills) {
    return Outcome.Player1Wins;
  }

  if (p2Kills) {
    return Outcome.Player2Wins;
  }

  return Outcome.Continue;
}

export class Game {
  turn = 0;
  moves: [Move, Move][] = [];
  states: [PlayerState, PlayerState];
  players: [Player, Player];

  constructor(
    player1: Player,
    player2: Player,
  ) {
    this.players = [player1, player2];
    this.states = [
      new PlayerState(),
      new PlayerState(),
    ];
    this.updatePlayers();
  }

  // play asks the players to make a move. It blocks until both players make a
  // move, then returns the outcome of the game. The game should be played
  // until the outcome is not a draw.
  async play(): Promise<Outcome> {
    const [p1, p2] = this.players;
    const [p1Move, p2Move] = await Promise.all([
      p1.play(),
      p2.play(),
    ]);

    const [p1State, p2State] = this.states;
    if (!p1State.update(p1Move) || !p2State.update(p2Move)) {
      return Outcome.IllegalMove;
    }

    const outcome = calculateOutcome(p1Move, p2Move);

    this.turn++;
    this.moves.push([p1Move, p2Move]);
    this.updatePlayers();

    return outcome;
  }

  updatePlayers() {
    const [p1, p2] = this.players;
    const [p1Move, p2Move] = this.moves[this.moves.length - 1] || [null, null];
    const [p1State, p2State] = this.states;
    p1.update(p1State, p2State, this.turn, p1Move);
    p2.update(p2State, p1State, this.turn, p2Move);
  }
}
