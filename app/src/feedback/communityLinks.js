const REPOSITORY_URL = 'https://github.com/e3o-labs/pet-readiness-simulator';

export const COMMUNITY_LINKS = Object.freeze({
  experience: REPOSITORY_URL + '/issues/2',
  feature: REPOSITORY_URL + '/issues/3',
  roadmap: REPOSITORY_URL + '/milestone/2',
  contribute: REPOSITORY_URL + '/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22',
});

const RETURN_SCREENS = new Set(['welcome', 'service_intro', 'onboarding', 'profiles', 'mission', 'feed', 'report']);

export function communityReturnScreen(sourceScreen, selectedProfileId) {
  return RETURN_SCREENS.has(sourceScreen) ? sourceScreen : (selectedProfileId ? 'mission' : 'service_intro');
}

export async function openCommunityLink(kind, linking) {
  if (!Object.hasOwn(COMMUNITY_LINKS, kind)) return { status: 'invalid_link' };
  try {
    await linking.openURL(COMMUNITY_LINKS[kind]);
    return { status: 'opened' };
  } catch {
    return { status: 'open_failed' };
  }
}
