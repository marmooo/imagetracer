export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class DPoint {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }
}

export class PathData {
  constructor(segments, isHole, holeChildren) {
    this.segments = segments;
    this.isHole = isHole;
    this.holeChildren = holeChildren;
  }
}

export const defaultOptions = {
  // scan
  filterPoints: 8,
  // smooth
  enhanceCorners: true,
  // trace
  lineTolerance: 1,
  splineTolerance: 1,
  // svg
  filterSegments: 0,
  mergePaths: true,
  precision: 1,
  strokeWidth: 1,
};
