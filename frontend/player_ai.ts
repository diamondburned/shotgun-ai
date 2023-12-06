import { updateLastMove, updatePlayerState } from "/frontend/frontend.ts";
import { Move, PlayerState } from "/game.ts";
import * as ai from "/ai/ai.ts";
import { Trainer } from "/ai/trainer.ts";
import { bestMove, predict } from "/ai/predict.ts";

export class AIPlayer {
  private element: HTMLElement;
  private stateElem: HTMLElement;
  private lastMoveDiv: HTMLDivElement;

  private turn: number;
  private state: PlayerState;
  private trainer: Trainer;
  private opponent: PlayerState;
  private lastMove?: Move;

  constructor(id: string, private model: ai.Model) {
    this.element = document.getElementById(id);
    this.trainer = new Trainer(model);
    this.stateElem = this.element.querySelector("div.player-state");
    this.lastMoveDiv = this.element.querySelector("div.last-move");
  }

  async play(): Promise<Move> {
    const prediction = await predict(this.model, this.gameState);
    for (const move of Object.values(Move)) {
      if (!this.state.isLegal(move)) {
        prediction[move as string] = -Infinity;
      }
    }
    this.lastMove = bestMove(prediction);
    return this.lastMove;
  }

  async trainWhenLost(opponentMove: Move): Promise<void> {
    for (let i = 0; i < 10; i++) {
      // Train this in small batches to avoid blocking the UI thread.
      const epochs = 5;
      await this.trainer.trainOnOpponent(this.gameState, opponentMove, { epochs });
    }
  }

  update(me: PlayerState, opponent: PlayerState, moves: number) {
    this.state = me;
    this.opponent = opponent;
    this.turn = moves;
    this.updateState();
    this.updateLastMove();
  }

  private get gameState(): GameState {
    return {
      myBulletsLoaded: this.state.bulletsLoaded,
      myShieldsRemaining: this.state.shieldsRemaining,
      myKnifeOut: this.state.knifeOut,
      opponentBulletsLoaded: this.opponent.bulletsLoaded,
      opponentShieldsRemaining: this.opponent.shieldsRemaining,
      opponentKnifeOut: this.opponent.knifeOut,
      turnCount: this.turn,
    };
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
