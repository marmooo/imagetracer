// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
export function detectEdges(indexedArray, colorIndex) {
  const width = indexedArray[0].length;
  const height = indexedArray.length;
  const layer = create2DArray(width, height);
  for (let j = 1; j < height; j++) {
    for (let i = 1; i < width; i++) {
      const jPrev = j - 1;
      const iPrev = i - 1;
      layer[j][i] = (indexedArray[jPrev][iPrev] === colorIndex ? 1 : 0) +
        (indexedArray[jPrev][i] === colorIndex ? 2 : 0) +
        (indexedArray[j][iPrev] === colorIndex ? 8 : 0) +
        (indexedArray[j][i] === colorIndex ? 4 : 0);
    }
  }
  return layer;
}

function create2DArray(width, height) {
  const layer = new Array(height);
  for (let j = 0; j < height; j++) {
    layer[j] = new Array(width);
    for (let i = 0; i < width; i++) {
      layer[j][i] = 0;
    }
  }
  return layer;
}
