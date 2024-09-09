# @marmooo/imagetracer

![alt bitmap to SVG](docs/img/s1.png)

Simple raster image tracer and vectorizer written in JavaScript.

## Usage

```
import { getPixels } from "https://deno.land/x/get_pixels/mod.ts";
import { OctreeQuantization } from "npm:@marmooo/color-reducer";
import { toSVG, toTraceData } from "npm:@marmooo/imagetracer";

const file = await Deno.readFile("test.png");
const image = await getPixels(file);
const imageData = new ImageData(
  new Uint8ClampedArray(image.data),
  image.width,
  image.height,
);
const quantized = OctreeQuantization(imageData);
const svg = toSVG(quantized.array, quantized.palette, options);
const traceData = toTraceData(quantized.array, quantized.palette, options);
```

## Process overview

See [process overview and ideas for improvement](process_overview.md).

## Features

- simplify API from original
  ([imagetracerjs](https://github.com/jankovicsandras/imagetracerjs))
- support ESM & Deno
- TODO: support multiple quantization algorithms (use
  [@marmooo/color-reducer](https://github.com/marmooo/color-reducer))
- minify & optimize output SVG
- add benchmarks & improve performance
- add tests & fixed some bugs
