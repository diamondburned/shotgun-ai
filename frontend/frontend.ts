import templates from "/frontend/templates.ts";
import { TemplateID } from "/frontend/templates.ts";
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

export function updateLastMove(lastMove: HTMLDivElement, move?: Move) {
  const moveTemplates: Record<Move, TemplateID> = {
    [Move.Reload]: "buttonReload",
    [Move.Shoot]: "buttonShoot",
    [Move.Block]: "buttonBlock",
    [Move.TakeOutKnife]: "buttonTakeOutKnife",
    [Move.Stab]: "buttonStab",
  };
  const templateID = moveTemplates[move] ?? "buttonBlankMove";
  const moveButton = templates.clone<HTMLButtonElement>(templateID);
  lastMove.innerHTML = "";
  lastMove.append(moveButton);
}
