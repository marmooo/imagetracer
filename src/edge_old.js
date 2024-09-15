// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
export function detectEdgesFromIndexedImage(
  indexedArray,
  width,
  height,
  colorIndex,
) {
  const newWidth = width + 2;
  const newHeight = height + 2;
  const layer = new Int8Array(newWidth * newHeight);
  const nextRight = width + 1;
  const prevRight = width - 1;
  for (let j = 0; j < height; j++) {
    const currRowIdx = j * width;
    const prevRowIdx = currRowIdx - width;
    const newCurrRowIdx = (j + 1) * newWidth;
    for (let i = 1; i < width; i++) {
      const iPrev = i - 1;
      layer[newCurrRowIdx + i + 1] =
        (indexedArray[prevRowIdx + iPrev] === colorIndex ? 1 : 0) +
        (indexedArray[prevRowIdx + i] === colorIndex ? 2 : 0) +
        (indexedArray[currRowIdx + iPrev] === colorIndex ? 8 : 0) +
        (indexedArray[currRowIdx + i] === colorIndex ? 4 : 0);
    }
    // left
    layer[newCurrRowIdx + 1] =
      (indexedArray[prevRowIdx] === colorIndex ? 2 : 0) +
      (indexedArray[currRowIdx] === colorIndex ? 4 : 0);
    // right
    layer[newCurrRowIdx + nextRight] =
      (indexedArray[prevRowIdx + prevRight] === colorIndex ? 1 : 0) +
      (indexedArray[currRowIdx + prevRight] === colorIndex ? 8 : 0);
  }
  // bottom
  const bottomPrevRowIdx = (height - 1) * width;
  const bottomNewCurrRowIdx = (newHeight - 1) * newWidth;
  for (let i = 1; i < width; i++) {
    const iPrev = i - 1;
    layer[bottomNewCurrRowIdx + i + 1] =
      (indexedArray[bottomPrevRowIdx + iPrev] === colorIndex ? 1 : 0) +
      (indexedArray[bottomPrevRowIdx + i] === colorIndex ? 2 : 0);
  }
  // bottom left
  layer[bottomNewCurrRowIdx + 1] = indexedArray[bottomPrevRowIdx] === colorIndex
    ? 2
    : 0;
  // bottom right
  layer[bottomNewCurrRowIdx + nextRight] =
    indexedArray[bottomPrevRowIdx + prevRight] === colorIndex ? 1 : 0;
  return layer;
}

// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
export function detectEdgesFromBordered(indexedArray, colorIndex) {
  const width = indexedArray[0].length;
  const height = indexedArray.length;
  const layer = create2DArray(width, height);
  for (let j = 1; j < height; j++) {
    const jPrev = j - 1;
    for (let i = 1; i < width; i++) {
      const iPrev = i - 1;
      layer[j][i] = (indexedArray[jPrev][iPrev] === colorIndex ? 1 : 0) +
        (indexedArray[jPrev][i] === colorIndex ? 2 : 0) +
        (indexedArray[j][iPrev] === colorIndex ? 8 : 0) +
        (indexedArray[j][i] === colorIndex ? 4 : 0);
    }
  }
  return layer;
}

// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
export function detectEdgesFromBordered8(
  indexedArray,
  width,
  height,
  colorIndex,
) {
  const layer = new Int8Array(width * height);
  for (let j = 1; j < height; j++) {
    const currRowIdx = j * width;
    const prevRowIdx = currRowIdx - width;
    for (let i = 1; i < width; i++) {
      const iPrev = i - 1;
      layer[currRowIdx + i] =
        (indexedArray[prevRowIdx + iPrev] === colorIndex ? 1 : 0) +
        (indexedArray[prevRowIdx + i] === colorIndex ? 2 : 0) +
        (indexedArray[currRowIdx + iPrev] === colorIndex ? 8 : 0) +
        (indexedArray[currRowIdx + i] === colorIndex ? 4 : 0);
    }
  }
  return layer;
}

export function detectEdgesFromBorderedPalette(indexedArray, palette) {
  const layers = new Array(palette.length);
  const width = indexedArray[0].length;
  const height = indexedArray.length;
  for (let k = 0; k < palette.length; k++) {
    layers[k] = create2DArray(width, height);
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

export function createBorderedArray(uint8, width, height) {
  const bordered = new Array(height + 2);
  for (let j = 0; j < height + 2; j++) {
    bordered[j] = new Array(width + 2);
  }
  for (let j = 0; j < height; j++) {
    const y = j * width;
    for (let i = 0; i < width; i++) {
      bordered[j + 1][i + 1] = uint8[y + i];
    }
  }
  for (let j = 0; j < height + 2; j++) {
    bordered[j][0] = -1;
    bordered[j][width + 1] = -1;
  }
  for (let i = 1; i < width + 1; i++) {
    bordered[0][i] = -1;
    bordered[height + 1][i] = -1;
  }
  return bordered;
}

export function createBorderedInt16Array(uint8, width, height) {
  const bordered = new Int16Array((width + 2) * (height + 2));
  for (let j = 0; j < height; j++) {
    const yFrom = j * width;
    const yTo = (j + 1) * (width + 2);
    for (let i = 0; i < width; i++) {
      bordered[yTo + i + 1] = uint8[yFrom + i];
    }
  }
  for (let i = 0; i < height + 2; i++) {
    const y = i * (width + 2);
    bordered[y] = -1;
    bordered[y + width + 1] = -1;
  }
  for (let j = 1; j < width + 1; j++) {
    bordered[j] = -1;
    bordered[(width + 2) * (height + 1) + j] = -1;
  }
  return bordered;
}

export function createPalette(replaceColors) {
  return replaceColors.map((rgb) => {
    const b = (rgb >> 16) & 0xFF;
    const g = (rgb >> 8) & 0xFF;
    const r = rgb & 0xFF;
    const a = 255;
    return { r, g, b, a };
  });
}
