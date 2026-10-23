export function validateResumeFile(file, { maxBytes, allowedExtensions, allowedMimeTypes }) {
  if (!file) return "missing";
  if (file.size > maxBytes) return "oversized";
  const lowerName = file.name.toLocaleLowerCase();
  const extensionAllowed = allowedExtensions.some((extension) => lowerName.endsWith(extension));
  const mimeAllowed = !file.type || allowedMimeTypes.includes(file.type);
  return extensionAllowed && mimeAllowed ? null : "unsupported";
}

export function createResumeMetadata(file) {
  return {
    fileName: file.name,
    size: file.size,
    mimeType: file.type || null,
    storageStatus: "session-selected",
  };
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
