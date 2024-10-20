import { containsBoundingBox } from "./scan.js";

export function filterHoles(indexedImage, width, layeredPaths, options) {
  const { filterHoles } = options;
  if (filterHoles <= 0) return;
  for (let i = 0; i < layeredPaths.length; i++) {
    const holedPaths = layeredPaths[i];
    for (let j = 0; j < holedPaths.length; j++) {
      const holedPath = holedPaths[j];
      if (!holedPath.isHole) continue;
      if (filterHoles < holedPath.points.length) continue;
      holedPath.ignore = true;
      const holedBoundingBox = holedPath.boundingBox;
      const indexes = getColorIndexes(indexedImage, width, holedPath);
      for (let k = 0; k < indexes.length; k++) {
        const nonHoledPaths = layeredPaths[indexes[k]];
        for (let m = 0; m < nonHoledPaths.length; m++) {
          const nonHoledPath = nonHoledPaths[m];
          if (filterHoles < nonHoledPath.points.length) continue;
          const nonHoledBoundingBox = nonHoledPath.boundingBox;
          if (containsBoundingBox(holedBoundingBox, nonHoledBoundingBox)) {
            nonHoledPath.ignore = true;
          }
        }
      }
    }
  }
}

function createMask(path, width, height, left, top) {
  function setBit(x, y) {
    x = x - left + 1;
    y = y - top + 1;
    mask[y * width + x] = 1;
  }

  const mask = new Uint8Array(width * height);
  const points = path.points;
  let prev = points[0];
  for (let i = 1; i <= points.length; i++) {
    const curr = points[i % points.length];
    if (prev.x === curr.x) {
      if (prev.y < curr.y) {
        setBit(curr.x - 1, prev.y);
      } else {
        setBit(curr.x, prev.y - 1);
      }
    } else if (prev.y === curr.y) {
      if (prev.x < curr.x) {
        setBit(curr.x - 1, curr.y);
      } else {
        setBit(prev.x - 1, curr.y - 1);
      }
    }
    prev = curr;
  }
  return mask;
}

function floodFill(mask, width, height, startX, startY) {
  const startIndex = startY * width + startX;
  if (mask[startIndex] > 0) return;
  const stack = [[startX, startY]];
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < 0) continue;
    if (width <= x) continue;
    if (y < 0) continue;
    if (height <= y) continue;
    const index = y * width + x;
    if (1 <= mask[index]) continue;
    mask[index] = 255;
    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }
}

function getColorIndexesFromMask(
  indexedImage,
  width,
  mask,
  maskWidth,
  maskHeight,
  path,
) {
  const indexes = new Set();
  const boundingBox = path.boundingBox;
  const left = boundingBox[0] - 1;
  const top = boundingBox[1] - 1;
  for (let j = 1; j < maskHeight - 1; j++) {
    for (let i = 1; i < maskWidth - 1; i++) {
      if (mask[j * maskWidth + i] < 255) { // 0: inner, 1: edge, 255: outer
        const index = indexedImage[(top + j) * width + left + i];
        indexes.add(index);
      }
    }
  }
  return Array.from(indexes);
}

function getColorIndexes(indexedImage, width, holedPath) {
  if (holedPath.points.length < 12) {
    const { x, y } = holedPath.points[0];
    const index = indexedImage[y * width + x];
    return [index];
  } else {
    const [left, top, right, bottom] = holedPath.boundingBox;
    const maskWidth = right - left + 2;
    const maskHeight = bottom - top + 2;
    const mask = createMask(holedPath, maskWidth, maskHeight, left, top);
    floodFill(mask, maskWidth, maskHeight, 0, 0);
    const indexes = getColorIndexesFromMask(
      indexedImage,
      width,
      mask,
      maskWidth,
      maskHeight,
      holedPath,
    );
    return indexes;
  }
}
