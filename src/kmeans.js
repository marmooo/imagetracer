function calcColorDistance(color, data, index) {
  // https://en.wikipedia.org/wiki/Rectilinear_distance
  // https://en.wikipedia.org/wiki/Euclidean_distance
  const r = Math.abs(color.r - data[index]);
  const g = Math.abs(color.g - data[index + 1]);
  const b = Math.abs(color.b - data[index + 2]);
  const a = Math.abs(color.a - data[index + 3]);
  return r + g + b + a;
}

function countColor(imageData, array, palette, counter) {
  const { data, width, height } = imageData;
  for (let i = 0; i < palette.length; i++) {
    counter[i] = [0, 0, 0, 0, 0];
  }
  let index = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      index = (y * imageData.width + x) * 4;
      let paletteIndex = 0;
      let maxColorDistance = Infinity;
      for (let k = 0; k < palette.length; k++) {
        const colorDistance = calcColorDistance(palette[k], data, index);
        if (colorDistance < maxColorDistance) {
          maxColorDistance = colorDistance;
          paletteIndex = k;
        }
      }
      const rgban = counter[paletteIndex];
      rgban[0] += data[index];
      rgban[1] += data[index + 1];
      rgban[2] += data[index + 2];
      rgban[3] += data[index + 3];
      rgban[4]++;
      array[y + 1][x + 1] = paletteIndex;
    }
  }
}

const defaultOptions = {
  colorsampling: 2,
  numColors: 16,
  mincolorratio: 0,
  colorquantcycles: 3,
};

export function kMeans(imageData, options = defaultOptions) {
  const { numColors } = options;
  const { width, height } = imageData;
  const pixelNum = width * height;
  const array = [];
  for (let y = 0; y < height + 2; y++) {
    array[y] = new Array(width);
    for (let x = 0; x < width + 2; x++) {
      array[y][x] = -1;
    }
  }
  const palette = samplePalette(numColors, imageData);
  const counter = new Array(palette.length);
  countColor(imageData, array, palette, counter);
  for (let cnt = 1; cnt < options.colorquantcycles; cnt++) {
    for (let k = 0; k < palette.length; k++) {
      const [r, g, b, a, n] = counter[k];
      if (n > 0) {
        palette[k] = {
          r: Math.floor(r / n),
          g: Math.floor(g / n),
          b: Math.floor(b / n),
          a: Math.floor(a / n),
        };
      }
      if (
        (n / pixelNum < options.mincolorratio) &&
        (cnt < options.colorquantcycles - 1)
      ) {
        palette[k] = {
          r: Math.floor(Math.random() * 255),
          g: Math.floor(Math.random() * 255),
          b: Math.floor(Math.random() * 255),
          a: Math.floor(Math.random() * 255),
        };
      }
    }
    countColor(imageData, array, palette, counter);
  }
  return { array, palette };
}

function samplePalette(numColors, imageData) {
  const palette = [];
  const data = imageData.data;
  for (let i = 0; i < numColors; i++) {
    const idx = Math.floor(Math.random() * data.length / 4) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    palette.push({ r, g, b, a });
  }
  return palette;
}

function samplePalette2(numColors, imageData) {
  const palette = [];
  const { data, width, height } = imageData;
  const nx = Math.ceil(Math.sqrt(numColors));
  const ny = Math.ceil(numColors / nx);
  const vx = width / (nx + 1);
  const vy = height / (ny + 1);
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      if (palette.length === numColors) {
        break;
      } else {
        const idx = Math.floor(((y + 1) * vy) * width + ((x + 1) * vx)) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        palette.push({ r, g, b, a });
      }
    }
  }
  return palette;
}
