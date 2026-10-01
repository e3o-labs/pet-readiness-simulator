import assert from 'node:assert/strict';
import { normalizePrivacyNoticeUrl, openPrivacyNotice } from '../src/feedback/privacyNotice.js';

assert.equal(normalizePrivacyNoticeUrl(''), '');
assert.equal(normalizePrivacyNoticeUrl('http://dogfirst.test/privacy'), '');
assert.equal(normalizePrivacyNoticeUrl('https://localhost/privacy'), '');
assert.equal(normalizePrivacyNoticeUrl('https://example.com/privacy'), '');
assert.equal(normalizePrivacyNoticeUrl('https://user:secret@dogfirst.test/privacy'), '');
assert.equal(normalizePrivacyNoticeUrl('https://dogfirst.test/privacy/feedback'), 'https://dogfirst.test/privacy/feedback');

let opened = '';
const linking = {
  canOpenURL: async (url) => url.startsWith('https://dogfirst.test/'),
  openURL: async (url) => { opened = url; },
};
const openedResult = await openPrivacyNotice('https://dogfirst.test/privacy/feedback', linking);
assert.equal(openedResult.status, 'opened');
assert.equal(opened, 'https://dogfirst.test/privacy/feedback');
assert.equal((await openPrivacyNotice('http://dogfirst.test/privacy', linking)).status, 'invalid_url');
assert.equal((await openPrivacyNotice('https://other.test/privacy', linking)).status, 'cannot_open');
assert.equal((await openPrivacyNotice('https://dogfirst.test/privacy', {
  canOpenURL: async () => true,
  openURL: async () => { throw new Error('unavailable'); },
})).status, 'open_failed');

console.log('Service feedback privacy notice passed: only approved-shape HTTPS URLs are exposed and open failures stay explicit.');
