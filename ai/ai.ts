import { Move, PlayerState } from "/game.ts";
import * as tf from "esm.sh/@tensorflow/tfjs@4.13.0";

// GameState determines the state of the game for the current move.
// It is used by the AI to predict the next move.
export type GameState = {
  myBulletsLoaded: number;
  myShieldsRemaining: number;
  myKnifeOut: boolean;
  opponentBulletsLoaded: number;
  opponentShieldsRemaining: number;
  opponentKnifeOut: boolean;
  turnCount: number;
};

export type TrainingData = {
  name?: string;
  data: {
    name?: string;
    state: GameState;
    move: Move;
    epochs?: number; // default to <parent>.epochs
    tolerance?: number; // default to <parent>.tolerance
  }[];
  epochs: number;
  tolerance: number;
}[];

// Trainer defines a class that can train a model to play the shotgun game.
// It exposes a model field that can be given to predict() to get a prediction
// for a given game state.
export class Trainer {
  readonly model = tf.sequential();

  // constructor creates a new empty model.
  constructor() {
    this.model.add(tf.layers.dense({ units: 7, inputShape: [7] }));
    // this.model.add(tf.layers.dense({ units: 7, activation: "relu" }));
    // this.model.add(tf.layers.dense({ units: 7, activation: "relu" }));
    this.model.add(tf.layers.dropout({ rate: 0.5 }));
    this.model.add(tf.layers.dropout({ rate: 0.2 }));
    this.model.add(tf.layers.dense({ units: 5, activation: "softmax" }));

    this.model.compile({
      optimizer: "adam",
      loss: "meanSquaredError",
      metrics: ["accuracy"],
    });
  }

  // train trains the model to predict the given move for the given game state.
  async train(state: GameState, intended: Move, epochs = 1) {
    const ys = tensorPrediction(movePrediction(intended));
    const xs = tensorGameState(state);

    await this.model.fit(xs, ys, { epochs });

    // Dispose of the tensors.
    xs.dispose();
    ys.dispose();
  }
}

// Prediction defines a prediction for a given game state.
// It represents the probability of each move.
export type Prediction = {
  reload: number;
  shoot: number;
  block: number;
  takeOutKnife: number;
  stab: number;
};

// movePrediction converts a move to a prediction, where:
//   - Reload:       [1, 0, 0, 0, 0]
//   - Shoot:        [0, 1, 0, 0, 0]
//   - Block:        [0, 0, 1, 0, 0]
//   - TakeOutKnife: [0, 0, 0, 1, 0]
//   - Stab:         [0, 0, 0, 0, 1]
function movePrediction(move: Move): Prediction {
  const prediction: Prediction = { reload: 0, shoot: 0, block: 0, takeOutKnife: 0, stab: 0 };
  prediction[move] = 1;
  return prediction;
}

// predict predicts the best move for a given game state.
// It accepts a pre-trained model and returns a prediction.
// To get the best move, use bestMove(prediction).
export async function predict(model: tf.LayersModel, state: GameState): Promise<Prediction> {
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

function tensorGameState(state: GameState): tf.Tensor2D {
  return tf.tensor2d([
    state.myBulletsLoaded,
    state.myShieldsRemaining,
    state.myKnifeOut ? 1 : 0,
    state.opponentBulletsLoaded,
    state.opponentShieldsRemaining,
    state.opponentKnifeOut ? 1 : 0,
    state.turnCount,
  ], [1, 7]);
}

function tensorPrediction(prediction: Prediction): tf.Tensor2D {
  return tf.tensor2d([
    prediction.reload,
    prediction.shoot,
    prediction.block,
    prediction.takeOutKnife,
    prediction.stab,
  ], [1, 5]);
}

// predictionIsGood returns true when the given move has its probability
// be greater than the tolerance, and false otherwise.
export function predictionIsGood(prediction: Prediction, move: Move, tolerance: number): boolean {
  const wantPrediction = prediction[move];

  const differences = Object.entries(prediction)
    .filter(([name]) => (name !== move))
    .map(([_, value]) => (wantPrediction - value));

  // Exit if any of the differences are negative.
  // This means that the move we want is less likely than another move.
  if (differences.find((value) => (value < 0)) !== undefined) {
    return false;
  }

  const minTolerance = Math.min(...differences);
  return tolerance < minTolerance;

  // Current Tolerance Logit Stuff (Yawwwnnnn)
  /*
  1. Get the Ideal Move from Prediction
  2. Loop Through all the Other Moves
  3. MinTol = abs. difference between Ideal and Other Moves
  4. If MinTol is greater than tolerance, return false


  Prediction setup:
  R: 0.4
  S: 0.2
  B: 0.1
  U: 0.2
  K: 0.1

  Differences:
  R-S: 0.2
  R-B: 0.3
  R-U: 0.2
  R-K: 0.3

  MinTol: 0.2
  Tolerance < MinTol: True
  return True.
  */
}

export class AIPlayer {
  private player: PlayerState;
  private opponent: PlayerState;
  private turn: number;

  constructor(private model: tf.LayersModel) {}

  async play(): Promise<Move> {
    const prediction = await predict(this.model, {
      myBulletsLoaded: this.player.bulletsLoaded,
      myShieldsRemaining: this.player.shieldsRemaining,
      myKnifeOut: this.player.knifeOut,
      opponentBulletsLoaded: this.opponent.bulletsLoaded,
      opponentShieldsRemaining: this.opponent.shieldsRemaining,
      opponentKnifeOut: this.opponent.knifeOut,
      turnCount: this.turn,
    });
    for (const move of Object.values(Move)) {
      if (!this.player.isLegal(move)) {
        prediction[move as string] = -Infinity;
      }
    }
    return bestMove(prediction);
  }

  update(player: PlayerState, opponent: PlayerState, turn: number) {
    this.player = player;
    this.opponent = opponent;
    this.turn = turn;
  }
}
