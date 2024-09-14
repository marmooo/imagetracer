import { detectEdges } from "./edge.js";
import {
  createBorderedArray,
  createBorderedInt8Array,
  detectEdgesByBordered,
  detectEdgesByBordered8,
  detectEdgesByBorderedPalette,
} from "./edge_old.js";

function createRandomIndexedImage(n) {
  const indexedImage = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) {
    indexedImage[i] = Math.round(Math.random());
  }
  return indexedImage;
}

const n = 100;
const indexedImage = createRandomIndexedImage(n);
const palette = [0, 1];

Deno.bench("detectEdges", () => {
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdges(indexedImage, n, n, k);
  }
});
Deno.bench("detectEdgesByBordered", () => {
  const arr = createBorderedArray(indexedImage, n, n);
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdgesByBordered(arr, k);
  }
});
Deno.bench("detectEdgesByBordered8", () => {
  const arr8 = createBorderedInt8Array(indexedImage, n, n);
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdgesByBordered8(arr8, n + 2, n + 2, k);
  }
});
Deno.bench("detectEdgesByBorderedPalette", () => {
  const arr = createBorderedArray(indexedImage, n, n);
  detectEdgesByBorderedPalette(arr, palette);
});
