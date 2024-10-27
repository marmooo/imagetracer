import { copySync } from "@std/fs";
import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.js"],
  outDir: "./npm",
  importMap: "deno.json",
  test: false,
  typeCheck: false,
  scriptModule: false,
  compilerOptions: {
    lib: ["ESNext"],
  },
  shims: {
    deno: true,
    custom: [{
      module: "./src/imagedata.ts",
      globalNames: ["ImageData"],
    }],
  },
  package: {
    name: "@marmooo/imagetracer",
    version: "0.0.1",
    description:
      "Simple raster image tracer and vectorizer written in JavaScript.",
    license: "MIT",
    main: "src/mod.js",
    repository: {
      type: "git",
      url: "git+https://github.com/marmooo/imagetracer.git",
    },
    bugs: {
      url: "https://github.com/marmooo/imagetracer/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
    copySync("test", "npm/esm/test");
    copySync("test", "npm/script/test");
  },
});
