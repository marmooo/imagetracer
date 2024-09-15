// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
export function detectEdges(
  indexedArray,
  width,
  height,
  colorIndex,
) {
  const layer = new Int8Array(width * height);
  for (let j = 1; j < height; j++) {
    const y = j * width;
    for (let i = 1; i < width; i++) {
      const index = y + i;
      if (indexedArray[index] === colorIndex) {
        layer[index] = 1;
        layer[index + 1] = 1;
        layer[index + width] = 1;
        layer[index + width + 1] = 1;
      }
    }
  }
  for (let k = width; k < layer.length; k++) {
    if (layer[k] === 0) continue;
    const i = k % width;
    const j = Math.floor(k / width);
    const currRowIdx = j * width;
    const prevRowIdx = currRowIdx - width;
    const iPrev = i - 1;
    layer[currRowIdx + i] =
      (indexedArray[prevRowIdx + iPrev] === colorIndex ? 1 : 0) +
      (indexedArray[prevRowIdx + i] === colorIndex ? 2 : 0) +
      (indexedArray[currRowIdx + iPrev] === colorIndex ? 8 : 0) +
      (indexedArray[currRowIdx + i] === colorIndex ? 4 : 0);
  }
  return layer;
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
