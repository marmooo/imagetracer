// Edge node types ( ▓: this layer or 1; ░: not this layer or 0 )
// 12  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓  ░░  ▓░  ░▓  ▓▓
// 48  ░░  ░░  ░░  ░░  ░▓  ░▓  ░▓  ░▓  ▓░  ▓░  ▓░  ▓░  ▓▓  ▓▓  ▓▓  ▓▓
//     0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
export function detectEdgesWithFiltering(
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
export function detectEdgesFromBordered16(
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
      const n2 = prevColumn[i] === val ? 2 : 0;
      const n3 = prevColumn[iNext] === val ? 2 : 0;
      const n4 = currColumn[iPrev] === val ? 8 : 0;
      const n5 = currColumn[iNext] === val ? 1 : 0;
      const n6 = nextColumn[iPrev] === val ? 8 : 0;
      const n7 = nextColumn[i] === val ? 1 : 0;
      const n8 = nextColumn[iNext] === val ? 4 : 0;
      const layer = layers[val];
      layer[jNext][iNext] = 1 + n5 * 2 + n8 + n7 * 8;
      if (n4 === 0) layer[jNext][i] = 2 + n7 * 4 + n6;
      if (n2 === 0) layer[j][iNext] = n3 + n5 * 4 + 8;
      if (n1 === 0) layer[j][i] = n2 + 4 + n4;
    }
  }
  return layers;
}

export function detectEdgesFromBordered16Palette(
  indexedArray,
  width,
  height,
  palette,
) {
  const layers = new Array(palette.length);
  for (let k = 0; k < palette.length; k++) {
    layers[k] = new Uint8Array(width * height);
  }
  for (let j = 1; j < height - 1; j++) {
    const currColumn = j * width;
    const prevColumn = currColumn - width;
    const nextColumn = currColumn + width;
    for (let i = 1; i < width - 1; i++) {
      const val = indexedArray[currColumn + i];
      const iPrev = i - 1;
      const iNext = i + 1;
      const n1 = indexedArray[prevColumn + iPrev] === val ? 1 : 0;
      const n2 = indexedArray[prevColumn + i] === val ? 2 : 0;
      const n3 = indexedArray[prevColumn + iNext] === val ? 2 : 0;
      const n4 = indexedArray[currColumn + iPrev] === val ? 8 : 0;
      const n5 = indexedArray[currColumn + iNext] === val ? 1 : 0;
      const n6 = indexedArray[nextColumn + iPrev] === val ? 8 : 0;
      const n7 = indexedArray[nextColumn + i] === val ? 1 : 0;
      const n8 = indexedArray[nextColumn + iNext] === val ? 4 : 0;
      const layer = layers[val];
      layer[nextColumn + iNext] = 1 + n5 * 2 + n8 + n7 * 8;
      if (n4 === 0) layer[nextColumn + i] = 2 + n7 * 4 + n6;
      if (n2 === 0) layer[currColumn + iNext] = n3 + n5 * 4 + 8;
      if (n1 === 0) layer[currColumn + i] = n2 + 4 + n4;
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
  const newWidth = width + 2;
  const newHeight = height + 2;
  const bordered = new Array(newHeight);
  for (let j = 0; j < newHeight; j++) {
    bordered[j] = new Array(newWidth);
  }
  for (let j = 0; j < height; j++) {
    const y = j * width;
    for (let i = 0; i < width; i++) {
      bordered[j + 1][i + 1] = uint8[y + i];
    }
  }
  for (let j = 0; j < newHeight; j++) {
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

export function createPalette(replaceColors) {
  return replaceColors.map((rgb) => {
    const b = (rgb >> 16) & 0xFF;
    const g = (rgb >> 8) & 0xFF;
    const r = rgb & 0xFF;
    const a = 255;
    return { r, g, b, a };
  });
}
