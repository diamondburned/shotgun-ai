import { Move } from "/game.ts";
import { GameState, Model, Prediction, tensorGameState } from "/ai/ai.ts";
import * as tf from "@tensorflow/tfjs";

// predict predicts the best move for a given game state.
// It accepts a pre-trained model and returns a prediction.
// To get the best move, use bestMove(prediction).
export async function predict(model: Model, state: GameState): Promise<Prediction> {
  const xs = tensorGameState(state);
  const ys = model.predict(xs) as tf.Tensor2D;
  const predictionArray = await ys.data() as Float32Array;
  const prediction: Prediction = {
    reload: predictionArray[0],
    shoot: predictionArray[1],
    block: predictionArray[2],
    takeOutKnife: predictionArray[3],
    stab: predictionArray[4],
  };

  // Dispose of the tensors.
  xs.dispose();
  ys.dispose();

  return prediction;
}

// bestMove picks the best move from a prediction.
export function bestMove(prediction: Prediction): Move {
  let max = -Infinity, maxName = "";
  for (const [name, value] of Object.entries(prediction)) {
    if (value > max) {
      max = value;
      maxName = name;
    }
  }
  return maxName as Move;
}
