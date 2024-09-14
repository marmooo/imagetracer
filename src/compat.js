export function createBorderedArray(indexedImage, width, height) {
  const layer = new Array(height);
  for (let j = 0; j < height + 2; j++) {
    layer[j] = new Array(width);
    for (let i = 0; i < width + 2; i++) {
      layer[j][i] = -1;
    }
  }
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const index = j * height + i;
      layer[j + 1][i + 1] = indexedImage[index];
    }
  }
  return layer;
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
