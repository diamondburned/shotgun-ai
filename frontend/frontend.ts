import templates from "/frontend/templates.ts";
import { Move, PlayerState } from "/game.ts";

export function updatePlayerState(state: PlayerState, el: HTMLElement) {
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

export function updateLastMove(lastMove: HTMLDivElement, move: Move) {
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
