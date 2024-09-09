import ImageTracer from "npm:imagetracerjs";
import { kMeans } from "./kmeans.js";
import { detectEdges } from "./edge.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";

Deno.bench("@marmooo/imagetracer", async () => {
  for await (const file of expandGlob("test/normal/*.jpg")) {
    const blob = await Deno.readFile(file.path);
    const image = await getPixels(blob);
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    const quantized = kMeans(imageData);
    const { array, palette } = quantized;
    for (let k = 0; k < palette.length; k++) {
      const edges = detectEdges(array, k);
      const paths = scanPaths(edges);
      const smoothedPaths = smoothPaths(paths);
      for (let i = 0; i < smoothedPaths.length; i++) {
        trace(smoothedPaths[i]);
      }
    }
  }
});
Deno.bench("imagetracerjs", async () => {
  const pathomit = 8;
  const ltres = 1;
  const qtres = 1;
  for await (const file of expandGlob("test/normal/*.jpg")) {
    const blob = await Deno.readFile(file.path);
    const image = await getPixels(blob);
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    const quantized = kMeans(imageData);
    const { palette } = quantized;
    for (let k = 0; k < palette.length; k++) {
      const edges = ImageTracer.layeringstep(quantized, k);
      const paths = ImageTracer.pathscan(edges, pathomit);
      const smoothedPaths = ImageTracer.internodes(paths, {
        rightangleenhance: true,
      });
      for (let i = 0; i < smoothedPaths.length; i++) {
        ImageTracer.tracepath(smoothedPaths[i], ltres, qtres).segments;
      }
    }
  }
});
