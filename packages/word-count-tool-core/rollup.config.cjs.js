import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/word-counter/word-counter.ts",
  output: {
    dir: "dist/cjs",
    format: "cjs",
    entryFileNames: "[name].cjs",
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
