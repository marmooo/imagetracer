// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
export function detectEdges16(indexedArray, width, height, colorIndex) {
  const layer = new Int16Array(width * height);
  for (let j = 1; j < height; j++) {
    const prevRowIdx = (j - 1) * width;
    const currRowIdx = j * width;
    for (let i = 1; i < width; i++) {
      const prevColIdx = currRowIdx + (i - 1);
      const prevRowPrevColIdx = prevRowIdx + (i - 1);
      layer[currRowIdx + i] =
        (indexedArray[prevRowPrevColIdx] === colorIndex ? 1 : 0) +
        (indexedArray[prevRowIdx + i] === colorIndex ? 2 : 0) +
        (indexedArray[prevColIdx] === colorIndex ? 8 : 0) +
        (indexedArray[currRowIdx + i] === colorIndex ? 4 : 0);
    }
  }
  return layer;
}

export function detectEdgesByPalette(indexedArray, palette) {
  const layers = new Array(palette.length);
  const width = indexedArray.length;
  const height = indexedArray[0].length;
  for (let k = 0; k < palette.length; k++) {
    layers[k] = createBorderedArray(width, height);
  }
  for (let j = 1; j < height - 1; j++) {
    const jPrev = j - 1;
    const jNext = j + 1;
    const prevColumn = indexedArray[jPrev];
    const currColumn = indexedArray[j];
    const nextColumn = indexedArray[jNext];
    for (let i = 1; i < width - 1; i++) {
      const val = indexedArray[j][i];
      const iPrev = i - 1;
      const iNext = i + 1;
      const n1 = prevColumn[iPrev] === val ? 1 : 0;
      const n2 = prevColumn[i] === val ? 1 : 0;
      const n3 = prevColumn[iNext] === val ? 1 : 0;
      const n4 = currColumn[iPrev] === val ? 1 : 0;
      const n5 = currColumn[iNext] === val ? 1 : 0;
      const n6 = nextColumn[iPrev] === val ? 1 : 0;
      const n7 = nextColumn[i] === val ? 1 : 0;
      const n8 = nextColumn[iNext] === val ? 1 : 0;
      const layer = layers[val];
      layer[jNext][iNext] = 1 + n5 * 2 + n8 * 4 + n7 * 8;
      if (!n4) layer[jNext][i] = 0 + 2 + n7 * 4 + n6 * 8;
      if (!n2) layer[j][iNext] = 0 + n3 * 2 + n5 * 4 + 8;
      if (!n1) layer[j][i] = 0 + n2 * 2 + 4 + n4 * 8;
    }
  }
  return layers;
}

function createBorderedArray(width, height) {
  const layer = new Array(height);
  for (let j = 0; j < height; j++) {
    layer[j] = new Array(width);
    for (let i = 0; i < width; i++) {
      layer[j][i] = 0;
    }
  }
  return layer;
}
