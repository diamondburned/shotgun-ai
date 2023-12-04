import { Game, Outcome, Player } from "/game.ts";
import { HumanPlayer } from "/frontend/player_human.ts";
import { AIPlayer } from "/frontend/player_ai.ts";
import * as ai from "/ai/ai.ts";

const modelName = "train-1701665330248.model";
const modelPath = `${window.location.origin}/ai/models/${modelName}`;

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

let outcome: Outcome;
do {
  turnElem.textContent = `${game.turn}`;
  outcome = await game.play();
} while (outcome == Outcome.Draw);

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
}
