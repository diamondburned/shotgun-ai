import { Move } from "/game.ts";
import {
  GameState,
  movePrediction,
  Prediction,
  tensorGameState,
  tensorPrediction,
  tfModelSave,
} from "/ai/ai.ts";
import * as tf from "esm.sh/@tensorflow/tfjs@4.14.0?target=es2022";

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

export type TrainOptions = Partial<{
  epochs: number;
  moveWeight: Prediction;
}>;

type SupportedSavePath = `file://${string}`;

// Trainer defines a class that can train a model to play the shotgun game.
// It exposes a model field that can be given to predict() to get a prediction
// for a given game state.
export class Trainer {
  // constructor creates a new empty model.
  constructor(readonly model = tf.sequential()) {
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
  async train(
    state: GameState,
    intended: Move,
    options: TrainOptions = {},
    // epochs = 1,
    // moveWeight?: Prediction,
  ) {
    const xs = tensorGameState(state);
    const ys = tensorPrediction(movePrediction(intended));

    let classWeight: { [key: number]: number } | undefined;
    if (options.moveWeight) {
      classWeight = {};
      const entries = Object.entries(options.moveWeight);
      for (let i = 0; i < entries.length; i++) {
        classWeight[i] = entries[i][1];
      }
    }

    await this.model.fit(xs, ys, {
      epochs: options.epochs,
      batchSize: 32,
      classWeight,
    });

    // Dispose of the tensors.
    xs.dispose();
    ys.dispose();
  }

  async save(path: SupportedSavePath) {
    let saveOutput: string | tf.io.IOHandler = path;

    if (path.startsWith("file://")) {
      const filePath = path.slice("file://".length);

      saveOutput = tf.io.withSaveHandler(async (artifacts) => {
        const fileData = tfModelSave(artifacts);
        await Deno.writeTextFile(filePath, fileData);

        return {
          modelArtifactsInfo: {
            dateSaved: new Date(),
            modelTopologyType: "JSON",
          },
        };
      });
    }

    await this.model.save(saveOutput);
  }
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
