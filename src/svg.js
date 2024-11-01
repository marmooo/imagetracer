import { defaultOptions } from "./util.js";

export function toSVGString(traceData, options = defaultOptions) {
  const { mergePaths } = options;
  const { layers, palette, width, height } = traceData;
  const viewBox = `viewBox="0 0 ${width} ${height}"`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" ${viewBox}>`;
  if (mergePaths) {
    for (let i = 0; i < traceData.layers.length; i++) {
      const layer = layers[i];
      const colorAttributes = toColorAttributes(palette[i], options);
      let d = "";
      for (let j = 0; j < layer.length; j++) {
        const pathData = layer[j];
        if (pathData.isHole) continue;
        d += toData(pathData, layer, options);
      }
      svg += `<path${colorAttributes} d="${d}"/>`;
    }
  } else {
    for (let i = 0; i < traceData.layers.length; i++) {
      const layer = layers[i];
      const colorAttributes = toColorAttributes(palette[i], options);
      for (let j = 0; j < layer.length; j++) {
        const pathData = layer[j];
        if (pathData.isHole) continue;
        const d = toData(pathData, layer, options);
        svg += `<path${colorAttributes} d="${d}"/>`;
      }
    }
  }
  svg += "</svg>";
  return svg;
}

function toColorString(rgba) {
  const b = rgba >> 16 & 0xFF;
  const g = rgba >> 8 & 0xFF;
  const r = rgba & 0xFF;
  const R = r.toString(16).padStart(2, "0");
  const G = g.toString(16).padStart(2, "0");
  const B = b.toString(16).padStart(2, "0");
  if (R[0] === R[1] && G[0] === G[1] && B[0] === B[1]) {
    return `#${R[0]}${G[0]}${B[0]}`;
  } else {
    return `#${R}${G}${B}`;
  }
}

function toColorAttributes(rgba, options = defaultOptions) {
  const { strokeWidth } = options;
  const colorString = toColorString(rgba);
  let fillStrokeAttr;
  if (colorString === "#000") {
    fillStrokeAttr = "";
  } else {
    fillStrokeAttr = ` fill="${colorString}"`;
  }
  const strokeWidthAttr = (strokeWidth === 0)
    ? ""
    : ` stroke="${colorString}" stroke-width="${strokeWidth}"`;
  return fillStrokeAttr + strokeWidthAttr;
}

function toData(pathData, layer, options) {
  let str = nonHoleData(pathData, options);
  str += holeChildrenData(pathData, layer, options);
  return str;
}

// https://stackoverflow.com/questions/11832914
function round(num, precision = 0) {
  const p = Math.pow(10, precision);
  const n = (num * p) * (1 + Number.EPSILON);
  return Math.round(n) / p;
}

function nonHoleData(pathData, options = defaultOptions) {
  if (pathData.ignore) return "";
  const { segments } = pathData;
  const { precision } = options;
  let prevType = "M";
  let str = "";
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
  const { holeChildren } = pathData;
  if (holeChildren.length === 0) return "";
  const { precision } = options;
  let prevType = "M";
  let str = "";
  if (precision !== -1) {
    for (let i = 0; i < holeChildren.length; i++) {
      // const segments = layer[holeChildren[i]].segments;
      const pathData = layer[holeChildren[i]];
      if (pathData.ignore) continue;
      const segments = pathData.segments;
      const lastPoint = getLastPoints(segments.at(-1));
      const x = round(lastPoint[0], precision);
      const y = round(lastPoint[1], precision);
      str += `M${x} ${y}`;
      for (let j = segments.length - 1; j >= 0; j--) {
        const { type, x1, y1, x2, y2, x3 } = segments[j];
        const numbers = x3 === undefined ? [x1, y1] : [x2, y2, x1, y1];
        const n = numbers.map((x) => round(x, precision)).join(" ");
        str += prevType == type ? " " + n : type + n;
        prevType = type;
      }
      str += "Z";
      prevType = "M";
    }
  } else {
    for (let i = 0; i < holeChildren.length; i++) {
      // const segments = layer[holeChildren[i]].segments;
      const pathData = layer[holeChildren[i]];
      if (pathData.ignore) continue;
      const segments = pathData.segments;
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
