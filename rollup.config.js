import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

const dev = process.env.ROLLUP_WATCH;

export default [
  // Library build configuration
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
      },
      {
        file: "dist/index.esm.js",
        format: "es",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        useTsconfigDeclarationDir: true,
      }),
      resolve(),
      commonjs(),
    ],
  },
  // Docs script configuration
  {
    input: "docs/script.ts",
    output: {
      file: "docs/script.js",
      format: "iife",
      name: "app",
    },
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        tsconfigOverride: {
          include: ["docs/script.ts", "src/**/*.ts"],
          compilerOptions: {
            declaration: false,
          },
        },
      }),
      resolve({
        browser: true,
      }),
      commonjs(),
      dev &&
        serve({
          open: true,
          contentBase: "docs",
          port: 3000,
        }),
      dev && livereload("docs"),
    ],
  },
];
