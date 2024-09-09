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
export function scanPaths(arr, options = defaultOptions) {
  const { filterPoints } = options;
  const paths = [];
  const width = arr[0].length;
  const height = arr.length;
  let px, py;
  let direction; // 0: right, 1: up, 2: left, 3: down
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      if (arr[j][i] === 4 || arr[j][i] === 11) { // Other values are not valid
        px = i;
        py = j;
        direction = 1;
        const isHole = arr[j][i] == 11;
        const path = new Path(i, j, isHole);
        paths.push(path);
        while (true) {
          const point = new Point(px - 1, py - 1);
          path.points.push(point);
          updateBoundingBox(path.boundingBox, px - 1, py - 1);
          const lookup = lookupTables[arr[py][px]][direction];
          arr[py][px] = lookup[0];
          direction = lookup[1];
          px += lookup[2];
          py += lookup[3];
          if (isClosePath(px, py, path.points[0])) {
            if (path.points.length < filterPoints) {
              paths.pop();
            } else {
              updateParent(paths, path);
            }
            break;
          }
        }
      }
    }
  }
  return paths;
}

function updateBoundingBox(boundingBox, px, py) {
  if (px < boundingBox[0]) boundingBox[0] = px;
  if (px > boundingBox[2]) boundingBox[2] = px;
  if (py < boundingBox[1]) boundingBox[1] = py;
  if (py > boundingBox[3]) boundingBox[3] = py;
}

function isClosePath(px, py, startPoint) {
  return (px - 1 === startPoint.x) && (py - 1 === startPoint.y);
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
