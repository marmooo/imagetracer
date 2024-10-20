import { defaultOptions, Point } from "./util.js";

class Path {
  points = [];
  holeChildren = [];

  constructor(px, py, isHole) {
    this.boundingBox = [px, py, px, py];
    this.isHole = isHole;
  }
}

// lookupTables[arr[py][px]][direction] = [nextArr[py][px], nextDirection, deltaPx, deltaPy]
const lookupTables = [
  [[-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]], // arr[py][px] === 0 is invalid
  [[0, 1, 0, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [0, 2, -1, 0]],
  [[-1, -1, -1, -1], [-1, -1, -1, -1], [0, 1, 0, -1], [0, 0, 1, 0]],
  [[0, 0, 1, 0], [-1, -1, -1, -1], [0, 2, -1, 0], [-1, -1, -1, -1]],

  [[-1, -1, -1, -1], [0, 0, 1, 0], [0, 3, 0, 1], [-1, -1, -1, -1]],
  [[13, 3, 0, 1], [13, 2, -1, 0], [7, 1, 0, -1], [7, 0, 1, 0]],
  [[-1, -1, -1, -1], [0, 1, 0, -1], [-1, -1, -1, -1], [0, 3, 0, 1]],
  [[0, 3, 0, 1], [0, 2, -1, 0], [-1, -1, -1, -1], [-1, -1, -1, -1]],

  [[0, 3, 0, 1], [0, 2, -1, 0], [-1, -1, -1, -1], [-1, -1, -1, -1]],
  [[-1, -1, -1, -1], [0, 1, 0, -1], [-1, -1, -1, -1], [0, 3, 0, 1]],
  [[11, 1, 0, -1], [14, 0, 1, 0], [14, 3, 0, 1], [11, 2, -1, 0]],
  [[-1, -1, -1, -1], [0, 0, 1, 0], [0, 3, 0, 1], [-1, -1, -1, -1]],

  [[0, 0, 1, 0], [-1, -1, -1, -1], [0, 2, -1, 0], [-1, -1, -1, -1]],
  [[-1, -1, -1, -1], [-1, -1, -1, -1], [0, 1, 0, -1], [0, 0, 1, 0]],
  [[0, 1, 0, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [0, 2, -1, 0]],
  [[-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]], // arr[py][px] === 15 is invalid
];

// Walking through an edge node array, discarding edge node types 0 and 15 and creating paths from the rest.
export function scanPaths(arr, width, height, options = defaultOptions) {
  const { filterPoints } = options;
  const paths = [];
  for (let j = 0; j < height; j++) {
    const y = j * width;
    for (let i = 0; i < width; i++) {
      const index = y + i;
      const type = arr[index];
      if (type === 4 || type === 11) {
        const path = scanPath(arr, i, j, width, filterPoints);
        if (path) {
          paths.push(path);
          updateParent(paths, path);
        }
      }
    }
  }
  return paths;
}

function scanPath(arr, x, y, width, filterPoints) {
  let index = y * width + x;
  const isHole = arr[index] === 11;
  const path = new Path(x, y, isHole);
  let direction = 1; // 0: right, 1: up, 2: left, 3: down
  while (true) {
    const nx = x - 1;
    const ny = y - 1;
    const point = new Point(nx, ny);
    path.points.push(point);
    updateBoundingBox(path.boundingBox, nx, ny);
    const lookup = lookupTables[arr[index]][direction];
    arr[index] = lookup[0];
    direction = lookup[1];
    x += lookup[2];
    y += lookup[3];
    index = y * width + x;
    if (isClosePath(x, y, path.points[0])) {
      if (path.points.length < filterPoints) {
        return null;
      }
      return path;
    }
  }
}

function updateBoundingBox(boundingBox, x, y) {
  if (x < boundingBox[0]) boundingBox[0] = x;
  if (x > boundingBox[2]) boundingBox[2] = x;
  if (y < boundingBox[1]) boundingBox[1] = y;
  if (y > boundingBox[3]) boundingBox[3] = y;
}

function isClosePath(x, y, startPoint) {
  return (x - 1 === startPoint.x) && (y - 1 === startPoint.y);
}

function containsBoundingBox(parentBBox, childBBox) {
  if (parentBBox[0] > childBBox[0]) return false;
  if (parentBBox[1] > childBBox[1]) return false;
  if (parentBBox[2] < childBBox[2]) return false;
  if (parentBBox[3] < childBBox[3]) return false;
  return true;
}

function isPointInPolygon(point, polygon) {
  let isInside = false;
  const numPoints = polygon.length;
  const { x, y } = point;
  for (let i = 0, j = numPoints - 1; i < numPoints; j = i++) {
    const p1 = polygon[i];
    const p2 = polygon[j];
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    const intersect = (y1 > y) !== (y2 > y) &&
      (x < (x2 - x1) * (y - y1) / (y2 - y1) + x1);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

function updateParent(paths, path) {
  if (!path.isHole) return;
  const pathIndex = paths.length - 1;
  let parentIndex = 0;
  for (let i = 0; i < pathIndex; i++) {
    const parentPath = paths[i];
    const currBBox = path.boundingBox;
    let parentBBox = parentPath.boundingBox;
    if (
      (!parentPath.isHole) &&
      containsBoundingBox(parentBBox, currBBox) &&
      isPointInPolygon(path.points[0], parentPath.points)
    ) {
      parentIndex = i;
      parentBBox = parentPath.boundingBox;
    }
  }
  paths[parentIndex].holeChildren.push(pathIndex);
}
