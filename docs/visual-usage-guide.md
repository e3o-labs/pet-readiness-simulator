# Visual usage guide

The shared header label is now 사용법. Five read-only steps show actual screenshots of this public application's web UI and identify the controls used for introduction, household conditions, profile selection, daily care and reflection. Screenshots use synthetic example choices and include no private user records or unreviewed education artwork. Dates, schedules and profile recommendations are examples; the user's live state may differ.

Instructions remain native Text with image accessibility labels. Screenshots are illustrative rather than interactive controls. Step changes scroll the guide to the top. Opening/closing it does not change the underlying screen, selected profile, drafts or care history. HeaderGuideMenu.js owns only local menu and step state.

Capture origin, source SHA and five media hashes are in usage-guide-assets.json. Public boundary checks permit this exact reviewed set and reject modified files or other images. Existing project and dependency rights remain in THIRD_PARTY_NOTICES.md.

Validation: full app tests, web export and public-boundary check passed. Browser verification covered 5 steps, images/alt text, scroll reset and return to the original care screen. Native iPhone validation and a new TestFlight upload are pending. Expert education content remains disabled and is not part of this change.
