#!/usr/bin/env -S deno run -A

import trainingData from "./training_data.ts";
import * as ai from "./game_ai.ts";

function shortPredictions(predictions: ai.Prediction): string {
  return Object.entries(predictions).map(([_, value]) => value.toFixed(2)).join(", ");
}

async function train(trainingData: ai.TrainingData): number {
  const trainer = new ai.Trainer();
  let iteration = 0;
  while (true) {
    iteration++;
    console.log(`iteration ${iteration}`);

    // Train our model on all the training cases at once.
    for (const trainingCase of trainingData) {
      console.log(`  training on ${trainingCase.name}...`);
      for (const data of trainingCase.data) {
        const epochs = data.epochs || trainingCase.epochs;
        await trainer.train(data.state, data.move, epochs);
      }
    }

    // Ensure that all the training cases are predicted correctly within the
    // wanted tolerance.
    let metTolerance = true;
    for (const trainingCase of trainingData) {
      for (const data of trainingCase.data) {
        const tolerance = data.tolerance || trainingCase.tolerance;

        const prediction = await ai.predict(trainer.model, data.state);
        const predictionString = shortPredictions(prediction);
        const predictionIsGood = ai.predictionIsGood(prediction, data.move, tolerance);

        const info = [
          `prediction=${predictionString}`,
          `want=${data.move}`,
        ].join(", ");

        if (!predictionIsGood) {
          metTolerance = false;
          console.log(`    ${info}: ${data.name} could not meet tolerance`);
        } else {
          console.log(`    ${info}: ${data.name} met tolerance`);
        }
      }
    }

    if (metTolerance) {
      break;
    }
  }
  return iteration;
}

for (let i = 0; i < 100; i++) {
  const iterations = await train(trainingData);
  console.log(`Trained in ${iterations} iterations.`);
  if (iterations > 200) {
    console.log(`Found a solution that took too long to train.`);
    break;
  }
}
