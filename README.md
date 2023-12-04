# cpsc-481-ai

AI project for the Shotgun Game.

## Training

```sh
./ai/train.ts --max-iterations 300
```

Then record the file path `.../models/train-XXXXX.model` and replace the
existing path in `frontend/index.ts`.

## Running

```sh
deno task serve
```
