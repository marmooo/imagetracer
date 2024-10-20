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
  constructor(segments, isHole, holeChildren, ignore) {
    this.segments = segments;
    this.isHole = isHole;
    this.holeChildren = holeChildren;
    this.ignore = ignore;
  }
}

export const defaultOptions = {
  // scan
  filterHoles: 0,
  // smooth
  enhanceCorners: true,
  // trace
  lineTolerance: 1,
  splineTolerance: 1,
  // svg
  mergePaths: true,
  precision: 1,
  strokeWidth: 1,
};
