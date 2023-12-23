import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/word-counter/word-counter.ts",
  output: {
    dir: "dist/esm",
    format: "esm",
    entryFileNames: "[name].mjs",
  },
  plugins: [
    typescript(),
    terser({
      format: {
        comments: false,
        beautify: true,
        ecma: "2016",
      },
      module: true,
    }),
  ],
};
