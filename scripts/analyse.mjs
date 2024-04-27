/*eslint-env node*/

import { build } from "esbuild";
import fs from "fs";

import getBuildConfig from "./buildConfig.mjs";

const settings = getBuildConfig("build", { minify: true, metafile: true });
const result = await build(settings);

// console.log(await analyzeMetafile(result.metafile, { verbose: false }));
fs.writeFileSync("build-meta.json", JSON.stringify(result.metafile));
console.log("Wrote: build-meta.json");
console.log("Use it here: https://esbuild.github.io/analyze/");
