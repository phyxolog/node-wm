const sharp = require("sharp");
const Canvas = require("canvas");

/**
 * Read file from disk and return image object.
 * 
 * @param {String} filePath Path to image
 * @returns {Sharp} Image object
 */
const readImage = (filePath) => sharp(filePath);

/**
 * Write a image object to disk.
 * 
 * @param {Sharp} image Image object
 * @param {String} filePath Path to save image
 */
const writeImage = (image, filePath) => image.toFile(filePath);

/**
 * Get image dimensions (width and height).
 * 
 * @param {Sharp} image Image object
 * @returns {Promise} Promise object represents the object format: { width, height }
 */
const getImageDimensions = (image) => {
  return new Promise(resolve => {
    image
      .metadata()
      .then((metadata) => {
        resolve({ width: metadata.width, height: metadata.height });
      });
  });
};

/**
 * Create a canvas with watermark and return a canvas buffer.
 * Note: If you want change a view of watermark - you
 * should be look on this method.
 * 
 * @param {Object} params format: { text, width, height }
 * @returns {Buffer} Canvas buffer
 */
const createWatermark = (params) => {
  if (!params || !params.text) {
    return;
  }

  var textWidth;
  var canvas = new Canvas(params.width, params.height);
  var context = canvas.getContext("2d");
  context.font = `${params.height / 24}px Arial`;
  context.beginPath();
  context.fillStyle = "rgba(255, 255, 255, 1)";

  const measuredText = context.measureText(params.text);
  textWidth = measuredText.width;

  context.shadowColor = "rgba(0, 0, 0, .86)";
  context.shadowBlur = 8;
  context.shadowOffsetX = 3;
  context.shadowOffsetY = 3;
  context.fillText(params.text, params.width - textWidth - 20, params.height - 20);

  return canvas.toBuffer();
};

/**
 * Merge main image and our overlay.
 * 
 * @param {Sharp} image Image object
 * @param {*} buffer Canvas buffer
 * @param {*} options Overlay options. For more details see documentation to Sharp.overlayWith
 * @returns {Sharp}
 */
const pasteOverlayToImage = (image, buffer, options) => {
  return image.overlayWith(buffer, options);
};

const image = readImage("./image.jpg");

getImageDimensions(image).then(({ width, height }) => {
  const params = { text: "my amesome watermark", width, height };
  const buffer = createWatermark(params);
  const imageWithWatermark = pasteOverlayToImage(image, buffer, { top: 0, left: 0 });
  writeImage(imageWithWatermark, "./output.jpg");
});