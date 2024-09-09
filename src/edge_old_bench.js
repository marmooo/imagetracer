import { detectEdges } from "./edge.js";
import { detectEdges16, detectEdgesByPalette } from "./edge_old.js";

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

Deno.bench("detectEdges", () => {
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdges(arr, k);
  }
});
Deno.bench("detectEdges16", () => {
  const layers = new Array(palette.length);
  for (let k = 0; k < layers.length; k++) {
    layers[k] = detectEdges16(arr16, n, n, k);
  }
});
Deno.bench("detectEdgesByPalette", () => {
  detectEdgesByPalette(arr, palette);
});
