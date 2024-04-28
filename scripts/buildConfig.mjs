/*eslint-env node*/
import imageminPlugin from "esbuild-plugin-imagemin";

/**
 * @param {string} mode
 * @param {import('esbuild').BuildOptions} [options={}] custom options
 * @returns {import('esbuild').BuildOptions} combined options
 */
export default function getBuildConfig(mode, options = {}) {
  return {
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "docs/bundle.js",
    target: "es2016",
    define: {
      MODE: JSON.stringify(mode),
      [`process.env.APP_BUILD_VERSION`]: JSON.stringify(
        process.env.npm_package_version
      ),
    },
    plugins: mode === "build" ? [imageminPlugin()] : [],
    loader: {
      ".json": "file",
      ".ogg": "file",
      ".png": "file",
      ".svg": "file",
    },
    alias: { "@img": "./src/img" },
    ...options,
  };
}
