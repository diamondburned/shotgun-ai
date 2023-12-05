import { Game, Move, Outcome, Player } from "/game.ts";
import { HumanPlayer } from "/frontend/player_human.ts";
import { AIPlayer } from "/frontend/player_ai.ts";
import * as templates from "/frontend/templates.ts";
import * as ai from "/ai/ai.ts";

const modelName = "train-1701739095888.model";
const modelPath = `${window.location.origin}/ai/models/${modelName}`;

const moveHistoryElem = document.getElementById("move-history");
const saveHistoryButton = document.getElementById("save-history") as HTMLButtonElement;

const turnElem = document.getElementById("turn");
const vsResult = document.querySelector("#vs .result");

const player1Elem = document.getElementById("player1");
const player2Elem = document.getElementById("player2");

const player1: Player = new HumanPlayer(
  player1Elem.id,
);

const player2: Player = new AIPlayer(
  player2Elem.id,
  await ai.load(modelPath as `http://${string}` | `https://${string}`),
);

const game = new Game(player1, player2);

saveHistoryButton.addEventListener("click", (ev) => {
  ev.preventDefault();
  const movesJSON = JSON.stringify(game.moves);
  const blob = new Blob([movesJSON], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `game-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

const moveIcons: Record<Move, templates.TemplateID> = {
  [Move.Reload]: "iconReload",
  [Move.Shoot]: "iconShoot",
  [Move.Block]: "iconBlock",
  [Move.TakeOutKnife]: "iconTakeOutKnife",
  [Move.Stab]: "iconStab",
};

let outcome: Outcome;
do {
  turnElem.textContent = `${game.turn + 1}`;
  outcome = await game.play();

  if (game.moves.length == 1) {
    moveHistoryElem.innerHTML = "";
    saveHistoryButton.disabled = false;
  }

  const [p1Move, p2Move] = game.moves[game.moves.length - 1];

  const p1MoveElem = templates.clone(moveIcons[p1Move]);
  const p2MoveElem = templates.clone(moveIcons[p2Move]);

  const moveItem = document.createElement("div");
  moveItem.classList.add("move");
  moveItem.appendChild(p1MoveElem);
  moveItem.appendChild(p2MoveElem);

  moveHistoryElem.appendChild(moveItem);
} while (outcome == Outcome.Continue);

switch (outcome) {
  case Outcome.Player1Wins:
    vsResult.textContent = "You win!";
    player1Elem.classList.add("player-won");
    player2Elem.classList.add("player-lost");
    break;
  case Outcome.Player2Wins:
    vsResult.textContent = "skill issue";
    player1Elem.classList.add("player-lost");
    player2Elem.classList.add("player-won");
    break;
  case Outcome.Draw:
    vsResult.textContent = "You both lose!";
    player1Elem.classList.add("player-lost");
    player2Elem.classList.add("player-lost");
    break;
  case Outcome.IllegalMove:
    vsResult.textContent = "YOU CHEATER!";
    break;
}
