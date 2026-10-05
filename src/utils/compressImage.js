// Makes a photo or screenshot smaller before sending it, so it uploads fast
// even with mobile data. Returns a JPEG data URL ("data:image/jpeg;base64,...").

// New size that fits inside a maxSide x maxSide box, keeping the proportions.
// Images that already fit keep their size.
export function scaleToFit(width, height, maxSide) {
  const biggestSide = Math.max(width, height);
  if (biggestSide <= maxSide) {
    return { width, height };
  }

  const ratio = maxSide / biggestSide;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo abrir la imagen"));
    image.src = src;
  });
}

// Fails when the browser cannot open the image (for example HEIC on Android).
// The original is never sent: it can be too big or a format admins can't view.
export async function compressImage(file, { maxSide = 1280, quality = 0.8 } = {}) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const { width, height } = scaleToFit(
      image.naturalWidth,
      image.naturalHeight,
      maxSide
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("El navegador no permite dibujar la imagen");

    // JPEG has no transparency: paint white first so transparent parts don't turn black
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (!dataUrl.startsWith("data:image/jpeg")) {
      throw new Error("El navegador no pudo crear el JPEG");
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
