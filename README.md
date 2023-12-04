# cpsc-481-ai

AI project for the Shotgun Game.

## Training

```sh
# Train a new model
./ai/train.ts --max-iterations 300

# Or a few...
for i in {1..10}; do ./ai/train.ts --max-iterations 300; done
# Train an existing model
./ai/train.ts --model-path ai/models/train-XXXXX.model
```

Interrupt the training process at any time to save the model.

Then record the model name (`train-XXXXX.model`) and replace the existing name in
`frontend/index.ts`.

## Running

```sh
deno task serve
```
