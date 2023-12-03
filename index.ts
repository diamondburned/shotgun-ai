import { Game, Move, Outcome, Player, PlayerState } from "/game.ts";

function getTemplateWithID(id: string): HTMLTemplateElement {
  const e = document.getElementById(`template-${id}`) as HTMLTemplateElement;
  if (!e) {
    throw new Error(`Could not find template with id ${id}`);
  }
  return e;
}

const templates = {
  _t: {
    buttonReload: getTemplateWithID("button-reload"),
    buttonShoot: getTemplateWithID("button-shoot"),
    buttonBlock: getTemplateWithID("button-block"),
    buttonTakeOutKnife: getTemplateWithID("button-take-out-knife"),
    buttonStab: getTemplateWithID("button-stab"),
  },
  clone<T extends HTMLElement>(id: keyof typeof this._t): T {
    const t = this._t[id] as HTMLTemplateElement;
    if (!t) {
      throw new Error(`Could not find template with ID ${id as string}`);
    }
    const childNodes = [...t.content.cloneNode(true).childNodes];
    return childNodes.find((e) => e instanceof HTMLElement) as T;
  },
};

function updatePlayerState(state: PlayerState, el: HTMLElement) {
  const numBullets = el.querySelector(".bullets");
  if (numBullets) {
    switch (state.bulletsLoaded) {
      case 0:
        numBullets.textContent = "No bullets loaded";
        break;
      case 1:
        numBullets.textContent = "1 bullet loaded";
        break;
      default:
        numBullets.textContent = `${state.bulletsLoaded} bullets loaded`;
        break;
    }
  }

  const numBlocks = el.querySelector(".blocks");
  if (numBlocks) {
    switch (state.shieldsRemaining) {
      case 0:
        numBlocks.textContent = "No blocks remaining";
        break;
      case 1:
        numBlocks.textContent = "1 block remaining";
        break;
      default:
        numBlocks.textContent = `${state.shieldsRemaining} blocks remaining`;
        break;
    }
  }

  const knife = el.querySelector(".knife") as HTMLElement;
  if (knife) {
    knife.textContent = state.knifeOut ? "Knife is out" : "";
  }
}

function updateLastMove(lastMove: HTMLDivElement, move: Move) {
  let templateID: keyof typeof templates._t;
  switch (move) {
    case Move.Reload:
      templateID = "buttonReload";
      break;
    case Move.Shoot:
      templateID = "buttonShoot";
      break;
    case Move.Block:
      templateID = "buttonBlock";
      break;
    case Move.TakeOutKnife:
      templateID = "buttonTakeOutKnife";
      break;
    case Move.Stab:
      templateID = "buttonStab";
      break;
    default:
      return;
  }
  const moveButton = templates.clone<HTMLButtonElement>(templateID);
  lastMove.innerHTML = "";
  lastMove.append(moveButton);
}

// HumanPlayer is a class that binds to move buttons on the page and implements
// game.ts#Player.
class HumanPlayer {
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

class AIPlayer {
  private element: HTMLElement;
  private stateElem: HTMLElement;
  private lastMoveDiv: HTMLDivElement;

  private state: PlayerState;
  private lastMove?: Move;

  constructor(id: string) {
    this.element = document.getElementById(id);
    this.stateElem = this.element.querySelector("div.player-state");
    this.lastMoveDiv = this.element.querySelector("div.last-move");
  }

  async play(): Promise<Move> {
    const move = await Promise.resolve(Move.Reload); // TODO
    this.lastMove = move;
    return move;
  }

  update(me: PlayerState, _opponent: PlayerState, _moves: number) {
    this.state = me;
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

const turnElem = document.getElementById("turn");
const vsResult = document.querySelector("#vs .result");
const player1: Player = new HumanPlayer("player1");
const player2: Player = new AIPlayer("player2");

const game = new Game(player1, player2);

let outcome: Outcome;
do {
  turnElem.textContent = `${game.turn}`;
  outcome = await game.play();
} while (outcome == Outcome.Draw);

switch (outcome) {
  case Outcome.Player1Wins:
    vsResult.textContent = "You win!";
    break;
  case Outcome.Player2Wins:
    vsResult.textContent = "skill issue";
    break;
}
