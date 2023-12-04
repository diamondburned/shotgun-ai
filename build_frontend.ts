#!/usr/bin/env -S deno run -A
import * as path from "std/path/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.19.7/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.2/mod.ts";

await esbuild.build({
  plugins: [
    ...denoPlugins({
      configPath: path.resolve("./deno.browser.json"),
      loader: "portable",
    }),
  ],
  entryPoints: ["frontend/index.ts"],
  outdir: ".",
  format: "esm",
  target: ["esnext", "chrome100"],
  bundle: true,
  minify: false,
  sourcemap: true,
});

esbuild.stop();
