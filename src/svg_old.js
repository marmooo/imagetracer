import { defaultOptions } from "./util.js";

export function toSVGString(traceData, options = defaultOptions) {
  const { scale, filterSegments } = options;
  const width = traceData.width * scale;
  const height = traceData.height * scale;
  const viewBox = `viewBox="0 0 ${width} ${height}"`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" ${viewBox}>`;
  for (let i = 0; i < traceData.layers.length; i++) {
    const layer = traceData.layers[i];
    for (let j = 0; j < layer.length; j++) {
      const pathData = layer[j];
      if (pathData.isHole) continue;
      if (pathData.segments.length < filterSegments) continue;
      svg += toPath(pathData, traceData, i, options);
    }
  }
  svg += "</svg>";
  return svg;
}

function toColorString(color) {
  const { r, g, b } = color;
  const R = r.toString(16).padStart(2, "0");
  const G = g.toString(16).padStart(2, "0");
  const B = b.toString(16).padStart(2, "0");
  if (R[0] === R[1] && G[0] === G[1] && B[0] === B[1]) {
    return `#${R[0]}${G[0]}${B[0]}`;
  } else {
    return `#${R}${G}${B}`;
  }
}

function toColorAttributes(color, options = defaultOptions) {
  const { strokeWidth } = options;
  const colorString = toColorString(color);
  let fillStrokeAttr;
  if (colorString === "#000") {
    fillStrokeAttr = "";
  } else {
    fillStrokeAttr = ` fill="${colorString}"`;
  }
  const opacity = color.a / 255;
  const opacityAttr = (opacity === 1) ? "" : ` opacity="${opacity}"`;
  const strokeWidthAttr = (strokeWidth === 0)
    ? ""
    : ` stroke="${colorString}" stroke-width="${strokeWidth}"`;
  return fillStrokeAttr + strokeWidthAttr + opacityAttr;
}

function toPath(pathData, traceData, layerIndex, options) {
  const { palette } = traceData;
  const colorAttributes = toColorAttributes(palette[layerIndex], options);
  const d = toData(pathData, traceData.layers[layerIndex], options);
  return `<path${colorAttributes} d="${d}"/>`;
}

function toData(pathData, layer, options) {
  let str = nonHoleData(pathData.segments, options);
  str += " ";
  str += holeChildrenData(pathData, layer, options);
  return str;
}

// https://stackoverflow.com/questions/11832914
function round(num, precision = 0) {
  return +num.toFixed(precision);
}

function nonHoleData(segments, options = defaultOptions) {
  const { precision } = options;
  let prevType = "M";
  let str;
  if (precision !== -1) {
    const x1 = round(segments[0].x1, precision);
    const y1 = round(segments[0].y1, precision);
    str = `M${x1} ${y1}`;
    for (let i = 0; i < segments.length; i++) {
      const { type, x2, y2, x3, y3 } = segments[i];
      const numbers = x3 === undefined ? [x2, y2] : [x2, y2, x3, y3];
      const n = numbers.map((x) => round(x, precision)).join(" ");
      str += prevType == type ? " " + n : type + n;
      prevType = type;
    }
  } else {
    const x1 = segments[0].x1;
    const y1 = segments[0].y1;
    str = `M${x1} ${y1}`;
    for (let i = 0; i < segments.length; i++) {
      const { type, x2, y2, x3, y3 } = segments[i];
      const numbers = x3 === undefined ? [x2, y2] : [x2, y2, x3, y3];
      const n = numbers.join(" ");
      str += prevType == type ? " " + n : type + n;
      prevType = type;
    }
  }
  return `${str}Z`;
}

function getLastPoints(segment) {
  const { x3 } = segment;
  if (x3 === undefined) {
    const { x2, y2 } = segment;
    return [x2, y2];
  } else {
    const { y3 } = segment;
    return [x3, y3];
  }
}

function holeChildrenData(pathData, layer, options = defaultOptions) {
  const { precision } = options;
  const { holeChildren } = pathData;
  if (holeChildren.length === 0) return "";
  let prevType = "M";
  let str = "";
  if (precision !== -1) {
    for (let i = 0; i < holeChildren.length; i++) {
      const segments = layer[holeChildren[i]].segments;
      const lastPoint = getLastPoints(segments.at(-1));
      const x = round(lastPoint[0]);
      const y = round(lastPoint[1]);
      str += `M${x} ${y}`;
      for (let j = segments.length - 1; j >= 0; j--) {
        const { type, x1, y1, x2, y2, x3 } = segments[j];
        const numbers = x3 === undefined ? [x1, y1] : [x2, y2, x1, y1];
        const n = numbers.map((x) => round(x)).join(" ");
        str += prevType == type ? " " + n : type + n;
        prevType = type;
      }
      str += "Z";
      prevType = "M";
    }
  } else {
    for (let i = 0; i < holeChildren.length; i++) {
      const segments = layer[holeChildren[i]].segments;
      const lastPoint = getLastPoints(segments.at(-1));
      str += `M${lastPoint[0]} ${lastPoint[1]}`;
      for (let j = segments.length - 1; j >= 0; j--) {
        const { type, x1, y1, x2, y2, x3 } = segments[j];
        const numbers = x3 === undefined ? [x1, y1] : [x2, y2, x1, y1];
        const n = numbers.join(" ");
        str += prevType == type ? " " + n : type + n;
        prevType = type;
      }
      str += "Z";
      prevType = "M";
    }
  }
  return str;
}
