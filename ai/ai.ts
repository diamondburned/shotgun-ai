import { Move } from "/game.ts";
import * as tf from "@tensorflow/tfjs";

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

// Prediction defines a prediction for a given game state.
// It represents the probability of each move.
export type Prediction = {
  reload: number;
  shoot: number;
  block: number;
  takeOutKnife: number;
  stab: number;
};

// Model defines a TensorFlow model.
export type Model = tf.LayersModel;

type SupportedLoadPath =
  | `file://${string}`
  | `http://${string}`
  | `https://${string}`;

// load loads a model from the given path.
export async function load(path: SupportedLoadPath): Promise<Model> {
  let loadInput: string | tf.io.IOHandler = path;

  if (path.startsWith("file://")) {
    const filepath = path.slice("file://".length);
    const fileData = await Deno.readTextFile(filepath);
    loadInput = tfModelLoader(fileData);
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load model: ${response.statusText}`);
    }

    const data = await response.text();
    loadInput = tfModelLoader(data);
  }

  return await tf.loadLayersModel(loadInput);
}

export function tensorGameState(state: GameState): tf.Tensor2D {
  const v = [
    state.myBulletsLoaded,
    state.myShieldsRemaining,
    state.myKnifeOut ? 1 : 0,
    state.opponentBulletsLoaded,
    state.opponentShieldsRemaining,
    state.opponentKnifeOut ? 1 : 0,
    // state.turnCount > 0 ? 1 : 0,
  ];
  return tf.tensor2d(v, [1, v.length]);
}

// movePrediction converts a move to a prediction, where:
//   - Reload:       [1, 0, 0, 0, 0]
//   - Shoot:        [0, 1, 0, 0, 0]
//   - Block:        [0, 0, 1, 0, 0]
//   - TakeOutKnife: [0, 0, 0, 1, 0]
//   - Stab:         [0, 0, 0, 0, 1]
export function movePrediction(move: Move, value = 1): Prediction {
  const prediction: Prediction = { reload: 0, shoot: 0, block: 0, takeOutKnife: 0, stab: 0 };
  prediction[move] = value;
  return prediction;
}

export function tensorPrediction(prediction: Prediction): tf.Tensor2D {
  return tf.tensor2d([
    prediction.reload,
    prediction.shoot,
    prediction.block,
    prediction.takeOutKnife,
    prediction.stab,
  ], [1, 5]);
}

export function tfModelLoader(fileData: string) {
  const lines = fileData.split("\n");
  const out: tf.io.ModelArtifacts = {
    modelTopology: JSON.parse(lines[0]),
    weightSpecs: JSON.parse(lines[1]),
    weightData: base64StringToArrayBuffer(lines[2]),
  };

  return tf.io.fromMemory(
    out.modelTopology,
    out.weightSpecs,
    out.weightData,
  );
}

export function tfModelSave(modelArtifacts: tf.io.ModelArtifacts) {
  if (!(modelArtifacts.weightData instanceof ArrayBuffer)) {
    // I can't figure out CompositeArrayBuffer :(
    throw "I give up lmao";
  }

  const lines = [
    JSON.stringify(modelArtifacts.modelTopology),
    JSON.stringify(modelArtifacts.weightSpecs),
    arrayBufferToBase64String(modelArtifacts.weightData),
  ];

  return lines.join("\n");
}

export function arrayBufferToBase64String(buffer: ArrayBuffer): string {
  const buf = new Uint8Array(buffer);
  let s = "";
  for (let i = 0, l = buf.length; i < l; i++) {
    s += String.fromCharCode(buf[i]);
  }
  return btoa(s);
}

export function base64StringToArrayBuffer(str: string): ArrayBuffer {
  const s = atob(str);
  const buffer = new Uint8Array(s.length);
  for (let i = 0; i < s.length; ++i) {
    buffer.set([s.charCodeAt(i)], i);
  }
  return buffer.buffer;
}
