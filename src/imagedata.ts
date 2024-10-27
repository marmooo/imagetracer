interface ImageDataSettings {
  colorSpace?: "srgb" | "display-p3";
}

export class ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  settings: ImageDataSettings;

  constructor(width: number, height: number);
  constructor(width: number, height: number, settings: ImageDataSettings);
  constructor(dataArray: Uint8ClampedArray, width: number);
  constructor(dataArray: Uint8ClampedArray, width: number, height: number);
  constructor(
    dataArray: Uint8ClampedArray,
    width: number,
    height: number,
    settings: ImageDataSettings,
  );
  constructor(
    arg1: number | Uint8ClampedArray,
    arg2: number,
    arg3?: number | ImageDataSettings,
    arg4?: ImageDataSettings,
  ) {
    if (typeof arg1 === "number" && typeof arg2 === "number") {
      this.width = arg1;
      this.height = arg2;
      this.settings = (typeof arg3 === "object" ? arg3 : {}) || {};
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else if (arg1 instanceof Uint8ClampedArray && typeof arg2 === "number") {
      this.data = arg1;
      this.width = arg2;
      if (typeof arg3 === "number") {
        this.height = arg3;
        this.settings = arg4 || {};
      } else {
        // new MyImageData(dataArray, width)
        this.height = this.data.length / (this.width * 4);
        this.settings = arg3 || {};
        if (!Number.isInteger(this.height)) {
          throw new Error("Invalid data array length for given width");
        }
      }
      if (this.data.length !== this.width * this.height * 4) {
        throw new Error("Invalid data array length");
      }
    } else {
      throw new Error("Invalid arguments");
    }
  }
}
