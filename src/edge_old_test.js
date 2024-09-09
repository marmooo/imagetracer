import { detectEdges } from "./edge.js";
import { detectEdges16, detectEdgesByPalette } from "./edge_old.js";
import { assertEquals } from "@std/assert";

// const arr = [
//   [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
//   [-1,1,1,1,1,0,0,0,1,-1],
//   [-1,1,1,1,1,0,1,0,1,-1],
//   [-1,1,1,1,1,0,0,1,1,-1],
//   [-1,1,0,0,1,0,0,0,1,-1],
//   [-1,1,1,1,1,0,0,0,1,-1],
//   [-1,1,1,1,1,0,0,0,1,-1],
//   [-1,1,0,0,1,0,1,0,1,-1],
//   [-1,1,1,1,1,0,0,0,1,-1],
//   [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
// ];
const n = 100;
const arr = new Array(n);
for (let j = 0; j < n; j++) {
  if (j === 0 || j == n - 1) {
    arr[j] = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[j][i] = -1;
    }
  } else {
    arr[j] = new Array(n);
    for (let i = 1; i < n - 1; i++) {
      arr[j][i] = Math.round(Math.random());
    }
    arr[j][0] = -1;
    arr[j][n - 1] = -1;
  }
}
const arr16 = new Int16Array(n * n);
for (let j = 0; j < n; j++) {
  for (let i = 0; i < n; i++) {
    const index = j * n + i;
    // if (j === 0 || j === n - 1 || i === 0 || i === n - 1) {
    //   arr16[index] = -1;
    // } else {
    //   arr16[index] = Math.round(Math.random());
    // }
    arr16[index] = arr[j][i];
  }
}
const palette = [0, 1];
Deno.test("data check", () => {
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const idx = j * n + i;
      assertEquals(arr[j][i], arr16[idx]);
    }
  }
});

const layers1 = new Array(palette.length);
for (let k = 0; k < layers1.length; k++) {
  layers1[k] = detectEdges(arr, k);
}

Deno.test("detectEdges16", () => {
  const layers2 = new Array(palette.length);
  for (let k = 0; k < layers2.length; k++) {
    layers2[k] = detectEdges16(arr16, n, n, k);
  }
  for (let k = 0; k < layers1.length; k++) {
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const idx = j * n + i;
        assertEquals(layers1[k][j][i], layers2[k][idx]);
      }
    }
  }
});
Deno.test("detectEdgesByPalette", () => {
  const layers2 = detectEdgesByPalette(arr, palette);
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
