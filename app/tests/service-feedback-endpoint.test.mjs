import assert from 'node:assert/strict';
import { normalizeFeedbackApiUrl } from '../src/feedback/feedbackEndpoint.js';

assert.equal(normalizeFeedbackApiUrl(''), '');
assert.equal(normalizeFeedbackApiUrl('http://feedback.dogfirst.test'), '');
assert.equal(normalizeFeedbackApiUrl('https://example.com/feedback'), '');
assert.equal(normalizeFeedbackApiUrl('https://feedback.dogfirst.invalid'), '');
assert.equal(normalizeFeedbackApiUrl('https://user:password@feedback.dogfirst.test'), '');
assert.equal(normalizeFeedbackApiUrl('https://feedback.dogfirst.test?token=visible'), '');
assert.equal(normalizeFeedbackApiUrl('http://127.0.0.1:8787'), '');
assert.equal(
  normalizeFeedbackApiUrl('http://127.0.0.1:8787/', { allowLocalHttp: true }),
  'http://127.0.0.1:8787',
);
assert.equal(normalizeFeedbackApiUrl('http://192.168.0.2:8787', { allowLocalHttp: true }), '');
assert.equal(normalizeFeedbackApiUrl('https://feedback.dogfirst.test'), 'https://feedback.dogfirst.test');

console.log('Service feedback endpoint passed: production is HTTPS-only and local HTTP requires an explicit loopback override.');
