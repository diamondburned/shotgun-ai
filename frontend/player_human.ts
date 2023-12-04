import { updateLastMove, updatePlayerState } from "/frontend/frontend.ts";
import { Move, PlayerState } from "/game.ts";
import templates from "/frontend/templates.ts";

// HumanPlayer is a class that binds to move buttons on the page and implements
// game.ts#Player.
export class HumanPlayer {
  private element: HTMLElement;
  private stateElem: HTMLElement;
  private movesForm: HTMLFormElement;
  private moveButtons: Record<Move, HTMLButtonElement> = {
    [Move.Reload]: templates.clone("buttonReload"),
    [Move.Shoot]: templates.clone("buttonShoot"),
    [Move.Block]: templates.clone("buttonBlock"),
    [Move.TakeOutKnife]: templates.clone("buttonTakeOutKnife"),
    [Move.Stab]: templates.clone("buttonStab"),
  };
  private lastMoveDiv: HTMLDivElement;

  private state: PlayerState;
  private lastMove?: Move;
  private resolveMove: (move: Move) => void;

  constructor(id: string) {
    this.element = document.getElementById(id);
    this.stateElem = this.element.querySelector("div.player-state");
    this.movesForm = this.element.querySelector("form.player-moves");
    this.movesForm.append(...Object.values(this.moveButtons));
    this.disableMoves();
    this.lastMoveDiv = this.element.querySelector("div.last-move");
    this.movesForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.resolveMove) {
        const button = e.submitter as HTMLButtonElement;
        this.resolveMove(button.value as Move);
        this.resolveMove = null;
        this.disableMoves();
      }
    });
  }

  async play(): Promise<Move> {
    const move = await new Promise<Move>((resolve) => {
      this.resolveMove = resolve;
      this.updateMoves();
    });
    this.lastMove = move;
    return move;
  }

  update(me: PlayerState, _opponent: PlayerState, _moves: number) {
    this.state = me;
    this.updateLastMove();
    this.updateState();
  }

  private updateState() {
    updatePlayerState(this.state, this.stateElem);
  }

  private updateLastMove() {
    if (this.lastMove) {
      updateLastMove(this.lastMoveDiv, this.lastMove);
    }
  }

  private updateMoves() {
    for (const [move, button] of Object.entries(this.moveButtons)) {
      button.disabled = !this.state.isLegal(move as Move);
    }
  }

  private disableMoves() {
    for (const button of Object.values(this.moveButtons)) {
      button.disabled = true;
    }
  }
}
