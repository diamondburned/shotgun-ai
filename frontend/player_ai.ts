import { updateLastMove, updatePlayerState } from "/frontend/frontend.ts";
import { Move, PlayerState } from "/game.ts";
import * as ai from "/ai/ai.ts";
import { bestMove, predict } from "/ai/predict.ts";

export class AIPlayer {
  private element: HTMLElement;
  private stateElem: HTMLElement;
  private lastMoveDiv: HTMLDivElement;

  private turn: number;
  private state: PlayerState;
  private opponent: PlayerState;
  private lastMove?: Move;

  constructor(id: string, private model: ai.Model) {
    this.element = document.getElementById(id);
    this.stateElem = this.element.querySelector("div.player-state");
    this.lastMoveDiv = this.element.querySelector("div.last-move");
  }

  async play(): Promise<Move> {
    const prediction = await predict(this.model, {
      myBulletsLoaded: this.state.bulletsLoaded,
      myShieldsRemaining: this.state.shieldsRemaining,
      myKnifeOut: this.state.knifeOut,
      opponentBulletsLoaded: this.opponent.bulletsLoaded,
      opponentShieldsRemaining: this.opponent.shieldsRemaining,
      opponentKnifeOut: this.opponent.knifeOut,
      turnCount: this.turn,
    });
    for (const move of Object.values(Move)) {
      if (!this.state.isLegal(move)) {
        prediction[move as string] = -Infinity;
      }
    }
    this.lastMove = bestMove(prediction);
    return this.lastMove;
  }

  update(me: PlayerState, opponent: PlayerState, moves: number) {
    this.state = me;
    this.opponent = opponent;
    this.turn = moves;
    this.updateState();
    this.updateLastMove();
  }

  private updateState() {
    updatePlayerState(this.state, this.stateElem);
  }

  private updateLastMove() {
    if (this.lastMove) {
      updateLastMove(this.lastMoveDiv, this.lastMove);
    }
  }
}
