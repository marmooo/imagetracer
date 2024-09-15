import {
  createBorderedArray,
  createBorderedInt16Array,
  detectEdgesFromBordered,
  detectEdgesFromBordered8,
  detectEdgesFromBorderedPalette,
  detectEdgesFromIndexedImage,
} from "./edge_old.js";

function createRandomIndexedImage(width, height, numColors) {
  const size = width * height;
  const indexedImage = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    indexedImage[i] = Math.floor(Math.random() * numColors);
  }
  return indexedImage;
}

const width = 500;
const height = 1000;
const numColors = 256;
const indexedImage = createRandomIndexedImage(width, height, numColors);
const palette = new Array(numColors);
for (let i = 0; i < palette.length; i++) {
  palette[i] = i;
}

Deno.bench("detectEdgesFromIndexedImage", () => {
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdgesFromIndexedImage(indexedImage, width, height, k);
  }
});
Deno.bench("detectEdgesFromBordered", () => {
  const arr = createBorderedArray(indexedImage, width, height);
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdgesFromBordered(arr, k);
  }
});
Deno.bench("detectEdgesFromBordered8", () => {
  const arr8 = createBorderedInt16Array(indexedImage, width, height);
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdgesFromBordered8(arr8, width + 2, height + 2, k);
  }
});
Deno.bench("detectEdgesFromBorderedPalette", () => {
  const arr = createBorderedArray(indexedImage, width, height);
  detectEdgesFromBorderedPalette(arr, palette);
});
