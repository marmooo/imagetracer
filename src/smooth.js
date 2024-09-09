import { defaultOptions, DPoint } from "./util.js";

// interpollating between path points for nodes with 8 directions
// (East, SouthEast, S, SW, W, NW, N, NE)
export function smoothPaths(paths, options = defaultOptions) {
  const result = new Array(paths.length);
  for (let i = 0; i < paths.length; i++) {
    const newPoints = [];
    result[i] = newPoints;
    const points = paths[i].points;
    const numPoints = points.length;
    for (let j = 0; j < numPoints; j++) {
      const point = points[j];
      const { x, y } = point;
      const n1 = points[(j + 1) % numPoints];
      const n2 = points[(j + 2) % numPoints];
      const x1 = n1.x;
      const y1 = n1.y;
      const x01 = (x + x1) / 2;
      const y01 = (y + y1) / 2;
      if (options.enhanceCorners) {
        const k = j + numPoints;
        const p1 = points[(k - 1) % numPoints];
        const p2 = points[(k - 2) % numPoints];
        const nearbyPoints = [p2, p1, point, n1, n2];
        if (isCorner(nearbyPoints)) {
          if (j > 0) {
            const lastPoint = newPoints.at(-1);
            lastPoint.direction = getDirection(lastPoint.x, lastPoint.y, x, y);
          }
          const direction = getDirection(x, y, x01, y01);
          const newPoint = new DPoint(x, y, direction);
          newPoints.push(newPoint);
        }
      }
      const x2 = n2.x;
      const y2 = n2.y;
      const x12 = (x1 + x2) / 2;
      const y12 = (y1 + y2) / 2;
      const direction = getDirection(x01, y01, x12, y12);
      const newPoint = new DPoint(x01, y01, direction);
      newPoints.push(newPoint);
    }
  }
  return result;
}

function isCorner(points) {
  const [p1, p2, p3, p4, p5] = points;
  const x3 = p3.x;
  const y3 = p3.y;
  return (
    (x3 === p1.x && x3 === p2.x && y3 === p4.y && y3 === p5.y) ||
    (y3 === p1.y && y3 === p2.y && x3 === p4.x && x3 === p5.x)
  );
}

function getDirection(x1, y1, x2, y2) {
  if (x1 < x2) {
    if (y1 < y2) return 1; // SouthEast
    if (y1 > y2) return 7; // NE
    return 0; // East
  } else if (x1 > x2) {
    if (y1 < y2) return 3; // SW
    if (y1 > y2) return 5; // NW
    return 4; // W
  } else {
    if (y1 < y2) return 2; // S
    if (y1 > y2) return 6; // N
    return 8; // center, this should not happen
  }
}
