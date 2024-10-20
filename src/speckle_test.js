import { MedianCut } from "@marmooo/color-reducer";
import { toSVG } from "./mod.js";
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
    const quantizer = new MedianCut(imageData, { cache: false });
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    const width = image.width;
    const height = image.height;
    const svg1 = toSVG(
      indexedImage,
      width,
      height,
      quantizer.replaceColors,
      { filterHoles: 0 },
    );
    const svg2 = toSVG(
      indexedImage,
      width,
      height,
      quantizer.replaceColors,
      { filterHoles: 12 },
    );
    assertEquals(svg2.length <= svg1.length, true);
  }
});
