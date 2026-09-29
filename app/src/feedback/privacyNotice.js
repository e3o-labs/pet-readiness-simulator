const FORBIDDEN_HOST_MARKERS = ['example.com', 'localhost', '127.0.0.1', 'replace', 'placeholder'];

export function normalizePrivacyNoticeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > 2048) return '';
  try {
    const parsed = new URL(raw);
    const lowered = raw.toLowerCase();
    if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password) return '';
    if (FORBIDDEN_HOST_MARKERS.some((marker) => lowered.includes(marker))) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

export async function openPrivacyNotice(value, linking) {
  const url = normalizePrivacyNoticeUrl(value);
  if (!url) return { status: 'invalid_url' };
  try {
    if (!(await linking.canOpenURL(url))) return { status: 'cannot_open' };
    await linking.openURL(url);
    return { status: 'opened' };
  } catch {
    return { status: 'open_failed' };
  }
}
