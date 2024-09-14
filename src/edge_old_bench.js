import { detectEdges } from "./edge.js";
import {
  createBorderedArray,
  createBorderedInt8Array,
  detectEdgesByBordered,
  detectEdgesByBordered8,
  detectEdgesByBorderedPalette,
} from "./edge_old.js";

function createRandomIndexedImage(width, height) {
  const size = width * height;
  const indexedImage = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    indexedImage[i] = Math.round(Math.random());
  }
  return indexedImage;
}

const width = 50;
const height = 100;
const indexedImage = createRandomIndexedImage(width, height);
const palette = [0, 1];

Deno.bench("detectEdges", () => {
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdges(indexedImage, width, height, k);
  }
});
Deno.bench("detectEdgesByBordered", () => {
  const arr = createBorderedArray(indexedImage, width, height);
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdgesByBordered(arr, k);
  }
});
Deno.bench("detectEdgesByBordered8", () => {
  const arr8 = createBorderedInt8Array(indexedImage, width, height);
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdgesByBordered8(arr8, width + 2, height + 2, k);
  }
});
Deno.bench("detectEdgesByBorderedPalette", () => {
  const arr = createBorderedArray(indexedImage, width, height);
  detectEdgesByBorderedPalette(arr, palette);
});
