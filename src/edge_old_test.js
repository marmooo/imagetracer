import { detectEdges } from "./edge.js";
import {
  createBorderedArray,
  createBorderedInt8Array,
  detectEdgesByBordered,
  detectEdgesByBordered8,
  detectEdgesByBorderedPalette,
} from "./edge_old.js";
import { assertEquals } from "@std/assert";

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
const arr = createBorderedArray(indexedImage, width, height);
const arr8 = createBorderedInt8Array(indexedImage, width, height);
const palette = [0, 1];

Deno.test("Array/Int8Array check", () => {
  for (let j = 0; j < height + 2; j++) {
    for (let i = 0; i < width + 2; i++) {
      const idx = j * (width + 2) + i;
      assertEquals(arr[j][i], arr8[idx]);
    }
  }
});

const layers1 = new Array(palette.length);
for (let k = 0; k < layers1.length; k++) {
  layers1[k] = detectEdgesByBordered(arr, k);
}

Deno.test("detectEdgesByBordered8", () => {
  const layers2 = new Array(palette.length);
  for (let k = 0; k < layers2.length; k++) {
    layers2[k] = detectEdgesByBordered8(arr8, width + 2, height + 2, k);
  }
  for (let k = 0; k < layers1.length; k++) {
    for (let j = 0; j < height + 2; j++) {
      for (let i = 0; i < width + 2; i++) {
        const idx = j * (width + 2) + i;
        assertEquals(layers1[k][j][i], layers2[k][idx]);
      }
    }
  }
});
Deno.test("detectEdgesByBorderedPalette", () => {
  const layers2 = detectEdgesByBorderedPalette(arr, palette);
  for (let k = 0; k < layers1.length; k++) {
    const height = layers1.length;
    const width = layers1[0].width;
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        assertEquals(layers1[k][j][i], layers2[k][j][i]);
      }
    }
  }
});
