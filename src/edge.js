// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
export function detectEdges(indexedArray, width, height, palette) {
  const layers = new Array(palette.length);
  for (let k = 0; k < palette.length; k++) {
    layers[k] = new Uint8Array(width * height);
  }
  for (let j = 1; j < height - 1; j++) {
    const prevColumn = (j - 1) * width;
    const currColumn = j * width;
    const nextColumn = (j + 1) * width;
    for (let i = 1; i < width - 1; i++) {
      const val = indexedArray[currColumn + i];
      const iPrev = i - 1;
      const iNext = i + 1;
      const n1 = indexedArray[prevColumn + iPrev] === val ? 1 : 0;
      const n2 = indexedArray[prevColumn + i] === val ? 1 : 0;
      const n3 = indexedArray[prevColumn + iNext] === val ? 1 : 0;
      const n4 = indexedArray[currColumn + iPrev] === val ? 1 : 0;
      const n5 = indexedArray[currColumn + iNext] === val ? 1 : 0;
      const n6 = indexedArray[nextColumn + iPrev] === val ? 1 : 0;
      const n7 = indexedArray[nextColumn + i] === val ? 1 : 0;
      const n8 = indexedArray[nextColumn + iNext] === val ? 1 : 0;
      const layer = layers[val];
      layer[nextColumn + iNext] = 1 + n5 * 2 + n8 * 4 + n7 * 8;
      if (!n4) layer[nextColumn + i] = 0 + 2 + n7 * 4 + n6 * 8;
      if (!n2) layer[currColumn + iNext] = 0 + n3 * 2 + n5 * 4 + 8;
      if (!n1) layer[currColumn + i] = 0 + n2 * 2 + 4 + n4 * 8;
    }
  }
  return layers;
}

export function createBorderedInt16Array(uint8, width, height) {
  const newWidth = width + 2;
  const newHeight = height + 2;
  const size = newWidth * newHeight;
  const bordered = new Int16Array(size);
  for (let j = 0; j < height; j++) {
    const yFrom = j * width;
    const yTo = (j + 1) * newWidth;
    for (let i = 0; i < width; i++) {
      bordered[yTo + i + 1] = uint8[yFrom + i];
    }
  }
  for (let i = 0; i < newHeight; i++) {
    const y = i * newWidth;
    bordered[y] = -1;
    bordered[y + width + 1] = -1;
  }
  const bottom = size - newWidth;
  for (let j = 1; j < width + 1; j++) {
    bordered[j] = -1;
    bordered[bottom + j] = -1;
  }
  return bordered;
}
