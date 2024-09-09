import { defaultOptions, Point } from "./util.js";

class FitStatus {
  constructor(status, errorPos, maxError) {
    this.status = status;
    this.errorPos = errorPos;
    this.maxError = maxError;
  }
}

// Recursively trying to fit straight and quadratic spline segments on the 8 direction internode path.
export function trace(points, options = defaultOptions) {
  const result = [];
  let i = 0;
  while (i < points.length) {
    const sequenceEnd = findSequenceEnd(points, i);
    result.push(...fit(points, i, sequenceEnd, options));
    i = (sequenceEnd > 0) ? sequenceEnd : points.length;
  }
  return result;
}

export function findSequenceEnd(points, startIndex) {
  const numPoints = points.length;
  const direction1 = points[startIndex].direction;
  let direction2 = -1;
  let sequenceEnd = startIndex + 1;
  let direction = points[sequenceEnd].direction;
  while (
    (direction === direction1 || direction == direction2 ||
      direction2 === -1) &&
    sequenceEnd < numPoints - 1
  ) {
    if (direction !== direction1 && direction2 === -1) {
      direction2 = direction;
    }
    sequenceEnd++;
    direction = points[sequenceEnd].direction;
  }
  if (sequenceEnd >= numPoints - 1) sequenceEnd = 0;
  return sequenceEnd;
}

export function fit(points, start, end, options = defaultOptions) {
  const pointsLength = points.length;
  if (end > pointsLength || end < 0) return [];
  const segmentLength = (end - start + pointsLength) % pointsLength;
  const startPoint = points[start];
  const endPoint = points[end];
  const isStraightLine = checkStraightLine(
    points,
    start,
    end,
    segmentLength,
    options.lineTolerance,
  );
  if (isStraightLine.status) return svgStraightLine(startPoint, endPoint);
  const fitPos = isStraightLine.errorPos;
  const controlPoint = calculateControlPoint(
    points,
    start,
    end,
    fitPos,
    segmentLength,
  );
  const isSpline = checkSpline(
    points,
    start,
    fitPos,
    end,
    controlPoint,
    segmentLength,
    options.splineTolerance,
  );
  if (isSpline.status) return svgSpline(startPoint, controlPoint, endPoint);
  // const splitPos = Math.floor((fitPos + isSpline.errorPos) / 2);
  const splitPos = fitPos;
  const segments = fit(points, start, splitPos, options);
  segments.push(...fit(points, splitPos, end, options));
  return segments;
}

function svgStraightLine(startPoint, endPoint) {
  return [{
    type: "L",
    x1: startPoint.x,
    y1: startPoint.y,
    x2: endPoint.x,
    y2: endPoint.y,
  }];
}

function svgSpline(startPoint, controlPoint, endPoint) {
  return [{
    type: "Q",
    x1: startPoint.x,
    y1: startPoint.y,
    x2: controlPoint.x,
    y2: controlPoint.y,
    x3: endPoint.x,
    y3: endPoint.y,
  }];
}

function checkStraightLine(points, start, end, segmentLength, lineTolerance) {
  const pointsLength = points.length;
  const startPoint = points[start];
  const endPoint = points[end];
  const vx = (endPoint.x - startPoint.x) / segmentLength;
  const vy = (endPoint.y - startPoint.y) / segmentLength;
  let i = (start + 1) % pointsLength;
  let status = true;
  let errorPos = start;
  let maxError = 0;
  while (i !== end) {
    const point = points[i];
    const pl = (i - start + pointsLength) % pointsLength;
    const px = startPoint.x + vx * pl;
    const py = startPoint.y + vy * pl;
    const distance = (point.x - px) ** 2 + (point.y - py) ** 2;
    if (distance > lineTolerance) status = false;
    if (distance > maxError) {
      errorPos = i;
      maxError = distance;
    }
    i = (i + 1) % pointsLength;
  }
  return new FitStatus(status, errorPos, maxError);
}

function calculateControlPoint(points, start, end, fitPos, segmentLength) {
  const t = (fitPos - start) / segmentLength;
  const u = 1 - t;
  const t1 = u ** 2;
  const t2 = 2 * u * t;
  const t3 = t ** 2;
  const startPoint = points[start];
  const fitPoint = points[fitPos];
  const endPoint = points[end];
  const x = (t1 * startPoint.x + t3 * endPoint.x - fitPoint.x) / -t2;
  const y = (t1 * startPoint.y + t3 * endPoint.y - fitPoint.y) / -t2;
  return new Point(x, y);
}

function checkSpline(
  points,
  start,
  errorPos,
  end,
  controlPoint,
  segmentLength,
  splineTolerance,
) {
  const pointsLength = points.length;
  const startPoint = points[start];
  const endPoint = points[end];
  let i = start + 1;
  let status = true;
  let maxError = 0;
  while (i !== end) {
    const point = points[i];
    const t = (i - start) / segmentLength;
    const u = 1 - t;
    const t1 = u ** 2;
    const t2 = 2 * u * t;
    const t3 = t ** 2;
    const px = t1 * startPoint.x + t2 * controlPoint.x + t3 * endPoint.x;
    const py = t1 * startPoint.y + t2 * controlPoint.y + t3 * endPoint.y;
    const distance = (point.x - px) ** 2 + (point.y - py) ** 2;
    if (distance > splineTolerance) status = false;
    if (distance > maxError) {
      errorPos = i;
      maxError = distance;
    }
    i = (i + 1) % pointsLength;
  }
  return new FitStatus(status, errorPos, maxError);
}
