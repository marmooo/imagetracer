import sharp from "sharp";
import { MedianCut } from "@marmooo/color-reducer";
import { toSVG } from "./mod.js";
import { expandGlob } from "@std/fs";
import { assertEquals } from "@std/assert";

Deno.test("check imagetracerjs data", async () => {
  for await (const file of expandGlob("test/imagetracerjs/*.png")) {
    const { data, info } = await sharp(file.path)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const uint8 = new Uint8ClampedArray(data);
    const quantizer = new MedianCut(uint8, info.width, info.height, {
      cache: false,
    });
    quantizer.apply(16);
    const indexedImage = quantizer.getIndexedImage();
    const width = info.width;
    const height = info.height;
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
