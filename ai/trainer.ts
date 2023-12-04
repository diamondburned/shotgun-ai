import { Move } from "/game.ts";
import {
  GameState,
  movePrediction,
  Prediction,
  tensorGameState,
  tensorPrediction,
  tfModelSave,
} from "/ai/ai.ts";
import * as tf from "@tensorflow/tfjs";

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
}>;

type SupportedSavePath = `file://${string}`;

let tempCounter = 0;

// Trainer defines a class that can train a model to play the shotgun game.
// It exposes a model field that can be given to predict() to get a prediction
// for a given game state.
export class Trainer {
  // constructor creates a new empty model.
  constructor(private model?: tf.LayersModel) {
    if (!model) {
      const model = tf.sequential();

      model.add(tf.layers.dense({ units: 7, inputShape: [7] }));
      // this.model.add(tf.layers.dense({ units: 7, activation: "relu" }));
      // this.model.add(tf.layers.dense({ units: 7, activation: "relu" }));
      model.add(tf.layers.dropout({ rate: 0.5 }));
      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(tf.layers.dense({ units: 5, activation: "softmax" }));

      this.model = model;
    }

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
  ) {
    const xs = tensorGameState(state);
    const ys = tensorPrediction(movePrediction(intended));

    await this.model.fit(xs, ys, {
      epochs: options.epochs,
      batchSize: 32,
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
        // Allow arbitrary interruption by saving into a temporary file
        // then atomically moving it into place. This trick does not work
        // on Windows :)
        const saveTime = new Date().getTime();
        const tempFile = `${filePath}.${saveTime}-${tempCounter++}.tmp`;

        const fileData = tfModelSave(artifacts);
        await Deno.writeTextFile(tempFile, fileData);
        await Deno.rename(tempFile, filePath);

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
