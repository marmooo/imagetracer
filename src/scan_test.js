import ImageTracer from "imagetracerjs";
import sharp from "sharp";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { scanPaths } from "./scan.js";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
  for await (const file of expandGlob("test/imagetracerjs/*.png")) {
    const { data, info } = await sharp(file.path)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const uint8 = new Uint8ClampedArray(data);
    const imageData = new ImageData(uint8, info.width, info.height);
    const quantizer = new MedianCut(imageData, { cache: false });
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    const array1 = createBorderedInt16Array(
      indexedImage,
      info.width,
      info.height,
    );
    const array2 = createBorderedArray(
      indexedImage,
      info.width,
      info.height,
    );
    const palette = createPalette(quantizer.replaceColors);
    const quantized2 = { array: array2, palette };
    const width = info.width + 2;
    const height = info.height + 2;
    const layers1 = detectEdges(array1, width, height, palette);
    const layers2 = ImageTracer.layering(quantized2);
    const filterPoints = 0;
    for (let k = 0; k < palette.length; k++) {
      const paths1 = scanPaths(layers1[k], width, height, { filterPoints });
      const paths2 = ImageTracer.pathscan(layers2[k], filterPoints);
      assertEquals(paths1.length, paths2.length);
      for (let i = 0; i < paths2.length; i++) {
        const path1 = paths1[i];
        const path2 = paths2[i];
        assertEquals(path1.points.length, path2.points.length);
        for (let j = 0; j < path2.points.length; j++) {
          const point1 = path1.points[j];
          const point2 = path2.points[j];
          assertEquals(point1.x, point2.x);
          assertEquals(point1.y, point2.y);
        }
        assertEquals(path1.holeChildren.length, path2.holechildren.length);
        for (let j = 0; j < path2.holechildren.length; j++) {
          const holeChild1 = path1.holeChildren[j];
          const holeChild2 = path2.holechildren[j];
          assertEquals(holeChild1, holeChild2);
        }
        for (let j = 0; j < path2.boundingbox.length; j++) {
          const point1 = path1.boundingBox[j];
          const point2 = path2.boundingbox[j];
          assertEquals(point1, point2);
        }
        assertEquals(path1.isHole, path2.isholepath);
      }
    }
  }
});
