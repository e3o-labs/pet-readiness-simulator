import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { COMMUNITY_LINKS, communityReturnScreen, openCommunityLink } from '../src/feedback/communityLinks.js';

const opened = [];
for (const kind of Object.keys(COMMUNITY_LINKS)) {
  assert.deepEqual(await openCommunityLink(kind, { openURL: async (url) => opened.push(url) }), { status: 'opened' });
  const url = new URL(opened.at(-1));
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'github.com');
  assert.ok(url.pathname.startsWith('/e3o-labs/pet-readiness-simulator/'));
  for (const privateField of ['note', 'logs', 'onboarding', 'screen', 'email']) assert.equal(url.searchParams.has(privateField), false);
}
assert.ok(Object.isFrozen(COMMUNITY_LINKS));
for (const kind of ['unknown', '__proto__', 'constructor', 'https://other.invalid', undefined]) {
  assert.deepEqual(await openCommunityLink(kind, { openURL: () => assert.fail('Invalid destinations must not open') }), { status: 'invalid_link' });
}
assert.deepEqual(await openCommunityLink('feature', { openURL: async () => { throw new Error('offline'); } }), { status: 'open_failed' });
for (const screen of ['welcome', 'service_intro', 'onboarding', 'profiles', 'mission', 'feed', 'report']) {
  assert.equal(communityReturnScreen(screen, ''), screen);
  assert.equal(communityReturnScreen(screen, 'fictional-dog'), screen);
}
for (const screen of ['unknown', undefined, 'service_feedback', 'service_feedback_export', 'private_screen']) {
  assert.equal(communityReturnScreen(screen, ''), 'service_intro', 'Reload before onboarding must return to a safe entry');
  assert.equal(communityReturnScreen(screen, 'fictional-dog'), 'mission', 'Reload after selection must preserve the care entry');
}

const app = await readFile(new URL('../App.js', import.meta.url), 'utf8');
const publicRoute = "if (state.screen === 'service_feedback' && !FEEDBACK_AVAILABLE)";
assert.ok(app.indexOf(publicRoute) < app.indexOf("if (state.screen === 'service_feedback') return"));
assert.ok(app.includes('onReturn={() => setScreen(communityReturnScreen(serviceFeedbackSourceScreen, state.selectedProfileId))}'));
const screen = await readFile(new URL('../src/feedback/CommunityFeedbackScreen.js', import.meta.url), 'utf8');
for (const copy of ['GitHub 로그인이 필요해요', '누구나 볼 수', '자동으로 첨부되지', '이전 화면으로 돌아가기']) assert.ok(screen.includes(copy));
assert.ok(screen.includes('accessibilityRole="link"'));
assert.ok(screen.includes('accessibilityRole="alert"'));
for (const forbidden of ['fetch(', 'loadProgress', 'saveFeedbackQueue', 'serviceFeedbackMessage']) assert.equal(screen.includes(forbidden), false);

const config = JSON.parse(await readFile(new URL('../../vercel.json', import.meta.url), 'utf8'));
assert.equal(config.installCommand, 'npm --prefix app ci');
assert.equal(config.buildCommand, 'npm --prefix app run build:web');
assert.equal(config.outputDirectory, 'app/dist');
assert.equal(config.framework, null);
assert.deepEqual(config.rewrites, [{ source: '/:path*', destination: '/' }]);
console.log('Community feedback passed: fixed public destinations, failure handling, disclosure, safe routing, and deployment configuration.');
