import { kMeans } from "./kmeans.js";
import { detectEdges } from "./edge.js";
import { scanPaths } from "./scan.js";
import { smoothPaths } from "./smooth.js";
import { trace } from "./trace.js";
import { traceOld1 } from "./trace_old.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
  for await (const file of expandGlob("test/imagetracerjs/*.png")) {
    const blob = await Deno.readFile(file.path);
    const image = await getPixels(blob);
    const imageData = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height,
    );
    const quantized = kMeans(imageData);
    const { array, palette } = quantized;
    for (let k = 0; k < palette.length; k++) {
      const edges = detectEdges(array, k);
      const paths = scanPaths(edges);
      const smoothedPaths = smoothPaths(paths);
      for (let i = 0; i < smoothedPaths.length; i++) {
        const segments1 = trace(smoothedPaths[i]);
        const segments2 = traceOld1(smoothedPaths[i]);
        assertEquals(segments1.length, segments2.length);
        for (let j = 0; j < segments2.length; j++) {
          const segment1 = segments1[j];
          const segment2 = segments2[j];
          assertEquals(segment1.type, segment2.type);
          assertEquals(segment1.x1, segment2.x1);
          assertEquals(segment1.y1, segment2.y1);
          assertEquals(segment1.x2, segment2.x2);
          assertEquals(segment1.y2, segment2.y2);
          assertEquals(segment1.x3, segment2.x3);
          assertEquals(segment1.y3, segment2.y3);
        }
      }
    }
  }
});
