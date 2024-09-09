import { kMeans } from "./kmeans.js";
import { detectEdges } from "./edge.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { traceOld1, traceOld2 } from "./trace_old.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";

Deno.bench("current", async () => {
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
Deno.bench("old1", async () => {
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
        traceOld1(smoothedPaths[i]);
      }
    }
  }
});
Deno.bench("old2", async () => {
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
        traceOld2(smoothedPaths[i]);
      }
    }
  }
});
