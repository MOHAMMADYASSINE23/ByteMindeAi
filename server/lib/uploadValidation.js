const SUPPORTED_UPLOADS = new Map([
  [".pdf", new Set(["application/pdf"])],
  [".png", new Set(["image/png"])],
  [".jpg", new Set(["image/jpeg"])],
  [".jpeg", new Set(["image/jpeg"])],
  [".webp", new Set(["image/webp"])],
  [".bmp", new Set(["image/bmp", "image/x-ms-bmp"])],
  [".gif", new Set(["image/gif"])],
]);

export function isSupportedInvoiceUpload(file) {
  if (!file || typeof file.originalname !== "string" || typeof file.mimetype !== "string") {
    return false;
  }

  const extension = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];
  const allowedMimeTypes = extension ? SUPPORTED_UPLOADS.get(extension) : null;
  return Boolean(allowedMimeTypes?.has(file.mimetype.toLowerCase()));
}
