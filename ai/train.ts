#!/usr/bin/env -S deno run -A --unstable

import trainingData from "/ai/training_data.ts";
import { predictionIsGood, Trainer, TrainingData } from "/ai/trainer.ts";
import { predict } from "/ai/predict.ts";
import * as ai from "/ai/ai.ts";
import * as flags from "std/flags/mod.ts";

const args = flags.parse(Deno.args, {
  string: ["max-iterations"],
  default: {
    "max-iterations": "1000",
  },
});

const maxIterations = parseInt(args["max-iterations"]);

function shortPredictions(predictions: ai.Prediction): string {
  return Object
    .entries(predictions)
    .map(([_, value]) => value.toFixed(2))
    .join(", ");
}

const modelTimestamp = new Date().getTime();
const modelDirectory = `${new URL(".", import.meta.url).pathname}models`;
const modelName = `${modelDirectory}/train-${modelTimestamp}.model`;

async function train(trainingData: TrainingData): Promise<void> {
  const trainer = new Trainer();
  let iteration = 0;
  while (iteration < maxIterations) {
    let output = "";
    output += `model: ${modelName}` + "\n\n";

    iteration++;
    output += `iteration ${iteration}` + "\n";

    // Train our model on all the training cases at once.
    for (const trainingCase of trainingData) {
      output += `  training on ${trainingCase.name}...` + "\n";
      for (const data of trainingCase.data) {
        const epochs = data.epochs || trainingCase.epochs;
        await trainer.train(data.state, data.move, {
          epochs: epochs,
        });
      }
    }

    // Ensure that all the training cases are predicted correctly within the
    // wanted tolerance.
    let metTolerance = true;
    for (const trainingCase of trainingData) {
      for (const data of trainingCase.data) {
        const tolerance = data.tolerance || trainingCase.tolerance;

        const prediction = await predict(trainer.model, data.state);
        const predictionString = shortPredictions(prediction);
        const predictionIsGood = predictionIsGood(prediction, data.move, tolerance);

        const info = [
          `prediction=${predictionString}`,
          `good=${predictionIsGood ? "1" : "0"}`,
          `want=${data.move}`,
        ].join(", ");
        output += `    ${info}: ${data.name}` + "\n";

        if (!predictionIsGood) {
          metTolerance = false;
        }
      }
    }

    console.log(output);

    if (metTolerance) {
      break;
    }
  }

  console.log(`\n`);
  console.log(`training stopped, took ${iteration} iterations total`);
  console.log(`saving model to ${modelName}`);
  await trainer.save(`file://${modelName}`);
}

await train(trainingData);
