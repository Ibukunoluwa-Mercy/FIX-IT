const API_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5100').replace(/\/$/, '');

export const normalizeReportImageUrl = (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.trim()) return '';

  try {
    const url = new URL(imageUrl, API_URL);
    if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
      return `${API_URL}${url.pathname}${url.search}${url.hash}`;
    }
    return url.href;
  } catch {
    return imageUrl;
  }
};

export const getReportImageUrls = (report) => [...new Set([
  ...(Array.isArray(report.images) ? report.images : []),
  ...(Array.isArray(report.photos) ? report.photos : []),
  report.imageUrl,
].map(normalizeReportImageUrl).filter(Boolean))];