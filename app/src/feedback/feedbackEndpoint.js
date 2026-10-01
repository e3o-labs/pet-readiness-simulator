const FORBIDDEN_PUBLIC_MARKERS = ['example.com', 'localhost', '127.0.0.1', '.invalid', 'replace', 'placeholder'];
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);

export function normalizeFeedbackApiUrl(value, options = {}) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > 2048) return '';
  try {
    const parsed = new URL(raw);
    if (!parsed.hostname || parsed.username || parsed.password || parsed.search || parsed.hash) return '';
    const localAllowed = options.allowLocalHttp === true
      && parsed.protocol === 'http:'
      && LOOPBACK_HOSTS.has(parsed.hostname);
    if (!localAllowed) {
      const lowered = raw.toLowerCase();
      if (parsed.protocol !== 'https:' || FORBIDDEN_PUBLIC_MARKERS.some((marker) => lowered.includes(marker))) return '';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}
