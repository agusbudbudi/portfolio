// Derives a human-readable filename from a Blob storage URL for display
// under upload fields — we don't track original filenames separately in
// state (avatar/thumbnail/cvUrl are plain URL strings), so the uploaded
// blob's own path segment is the only filename we have.
export function fileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const last = pathname.split('/').pop() ?? '';
    return decodeURIComponent(last) || url;
  } catch {
    return url;
  }
}
