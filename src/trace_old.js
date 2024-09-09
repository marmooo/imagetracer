import { fit } from "./trace.js";
import { defaultOptions } from "./util.js";

// Recursively trying to fit straight and quadratic spline segments on the 8 direction internode path.
export function traceOld1(points, options = defaultOptions) {
  const result = [];
  let i = 0;
  while (i < points.length) {
    const sequenceEnd = findSequenceEndOld1(points, i);
    result.push(...fit(points, i, sequenceEnd, options));
    i = (sequenceEnd > 0) ? sequenceEnd : points.length;
  }
  return result;
}

// Recursively trying to fit straight and quadratic spline segments on the 8 direction internode path.
export function traceOld2(points, options = defaultOptions) {
  const result = [];
  let i = 0;
  while (i < points.length) {
    const sequenceEnd = findSequenceEndOld2(points, i);
    result.push(...fit(points, i, sequenceEnd, options));
    i = (sequenceEnd > 0) ? sequenceEnd : points.length;
  }
  return result;
}

function findSequenceEndOld1(points, startIndex) {
  const directions = [
    points[startIndex].direction,
  ];
  let i = startIndex + 1;
  for (; i < points.length; i++) {
    const currentDirection = points[i].direction;
    if (directions.some((direction) => direction == currentDirection)) continue;
    if (directions.length == 2) {
      break;
    } else {
      directions.push(currentDirection);
    }
  }
  if (i >= points.length - 1) return 0;
  return i;
}

function findSequenceEndOld2(points, startIndex) {
  const direction1 = points[startIndex].direction;
  let direction2 = -1;
  let i;
  for (i = startIndex + 1; i < points.length; i++) {
    const direction = points[i].direction;
    if (direction === direction1) continue;
    if (direction2 === -1) {
      direction2 = direction;
    } else if (direction !== direction2) {
      break;
    }
  }
  return i >= points.length - 1 ? 0 : i;
}
