#!/usr/bin/env -S deno run -A
import * as game from "./game.ts";
import * as ai from "./game_ai.ts";

// export class GameState {
//   myBulletsLoaded: number;
//   myShieldsRemaining: number;
//   myKnifeOut: boolean;
//   opponentBulletsLoaded: number;
//   opponentShieldsRemaining: number;
//   opponentKnifeOut: boolean;
//   turnCount: number;
// }

function printPrediction(prediction: ai.Prediction) {
  console.log("prediction:", prediction);
  console.log("predicted move:", ai.bestMove(prediction));
  console.log("---");
}

const trainer = new ai.Trainer();

for (let i = 0; i < 100; i++) {
  // First Round is Always Reload
  await trainer.train(
    {
      myBulletsLoaded: 0,
      myShieldsRemaining: 9,
      myKnifeOut: false,
      opponentBulletsLoaded: 0,
      opponentShieldsRemaining: 9,
      opponentKnifeOut: false,
      turnCount: 0,
    },
    game.Move.Reload,
    10,
  );

  // If Reloaded Into Knife, Just Reload
  await trainer.train(
    {
      myBulletsLoaded: 1,
      myShieldsRemaining: 9,
      myKnifeOut: false,
      opponentBulletsLoaded: 0,
      opponentShieldsRemaining: 9,
      opponentKnifeOut: true,
      turnCount: 1,
    },
    game.Move.Reload,
    10,
  );

  // If Reloaded Into Block, Just Knife Out
  await trainer.train(
    {
      myBulletsLoaded: 1,
      myShieldsRemaining: 9,
      myKnifeOut: false,
      opponentBulletsLoaded: 0,
      opponentShieldsRemaining: 9,
      opponentKnifeOut: false,
      turnCount: 1,
    },
    game.Move.TakeOutKnife,
    10,
  );

  // If Reloaded Into Reload, Just Shoot
  await trainer.train(
    {
      myBulletsLoaded: 1,
      myShieldsRemaining: 9,
      myKnifeOut: false,
      opponentBulletsLoaded: 1,
      opponentShieldsRemaining: 9,
      opponentKnifeOut: false,
      turnCount: 1,
    },
    game.Move.Shoot,
    10,
  );
}

// Turn 1: Reload Against Knife Out
// Should Result in Reload Again
let myPredict = await ai.predict(trainer.model, {
  myBulletsLoaded: 1,
  myShieldsRemaining: 9,
  myKnifeOut: false,
  opponentBulletsLoaded: 0,
  opponentShieldsRemaining: 9,
  opponentKnifeOut: true,
  turnCount: 1,
});

printPrediction(myPredict);

ai.withinTolerance(myPredict, game.Move.Reload, 0.1);
