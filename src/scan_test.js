import ImageTracer from "imagetracerjs";
import { MedianCut } from "@marmooo/color-reducer";
import { createBorderedInt16Array, detectEdges } from "./edge.js";
import { createBorderedArray, createPalette } from "./edge_old.js";
import { scanPaths } from "./scan.js";
import { getPixels } from "get_pixels";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
  for await (const file of expandGlob("test/imagetracerjs/*.png")) {
    for (const filterPoints of [0, 8]) {
      const blob = await Deno.readFile(file.path);
      const image = await getPixels(blob);
      const imageData = new ImageData(
        new Uint8ClampedArray(image.data),
        image.width,
        image.height,
      );
      const quantizer = new MedianCut(imageData, { cache: false });
      quantizer.apply(16);
      const indexedImage = quantizer.getIndexedImage();
      const array1 = createBorderedInt16Array(
        indexedImage,
        image.width,
        image.height,
      );
      const array2 = createBorderedArray(indexedImage, image.width, image.height);
      const palette = createPalette(quantizer.replaceColors);
      const quantized2 = { array: array2, palette };
      const width = image.width + 2;
      const height = image.height + 2;
      for (let k = 0; k < palette.length; k++) {
        const edges1 = detectEdges(array1, width, height, k);
        const edges2 = ImageTracer.layeringstep(quantized2, k);
        const paths1 = scanPaths(edges1, width, height, { filterPoints });
        const paths2 = ImageTracer.pathscan(edges2, filterPoints);
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
  }
});
