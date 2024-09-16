import {
  createBorderedArray,
  createBorderedInt16Array,
  detectEdgesFromBordered,
  detectEdgesFromBordered16,
  detectEdgesFromBordered16Palette,
  detectEdgesFromBorderedPalette,
  detectEdgesFromIndexedImage,
  detectEdgesWithFiltering,
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
Deno.bench("detectEdgesWithFiltering", () => {
  const arr16 = createBorderedInt16Array(indexedImage, width, height);
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdgesWithFiltering(arr16, width + 2, height + 2, k);
  }
});
Deno.bench("detectEdgesFromBordered16", () => {
  const arr16 = createBorderedInt16Array(indexedImage, width, height);
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdgesFromBordered16(arr16, width + 2, height + 2, k);
  }
});
Deno.bench("detectEdgesFromBorderedPalette", () => {
  const arr = createBorderedArray(indexedImage, width, height);
  detectEdgesFromBorderedPalette(arr, palette);
});
Deno.bench("detectEdgesFromBordered16Palette", () => {
  const arr16 = createBorderedInt16Array(indexedImage, width, height);
  detectEdgesFromBordered16Palette(arr16, width + 2, height + 2, palette);
});
