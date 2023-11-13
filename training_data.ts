import type { TrainingData } from "./game_ai.ts";
import { Move } from "./game.ts";

const data: TrainingData = [
  {
    name: "Expect reload on second turn",
    data: [
      {
        name: "First round is always reload",
        state: {
          myBulletsLoaded: 0,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: false,
          turnCount: 0,
        },
        move: Move.Reload,
      },
      {
        name: "If Reloaded Into Knife, Just Reload",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: true,
          turnCount: 1,
        },
        move: Move.Reload,
      },
      {
        name: "If Reloaded Into Block, Just Knife Out",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 0,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: false,
          turnCount: 1,
        },
        move: Move.TakeOutKnife,
      },
      {
        name: "If Reloaded Into Reload, Just Shoot",
        state: {
          myBulletsLoaded: 1,
          myShieldsRemaining: 9,
          myKnifeOut: false,
          opponentBulletsLoaded: 1,
          opponentShieldsRemaining: 9,
          opponentKnifeOut: false,
          turnCount: 1,
        },
        move: Move.Shoot,
      },
    ],
    epochs: 10,
    tolerance: 0.01,
  },
];

export default data;
