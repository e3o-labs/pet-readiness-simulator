# Data boundary

This public repository is for code, public product documentation, and reviewed assets. It must not contain:

- Real participant or user records, responses, contact details, recruitment lists, or feedback exports.
- Physical-device evidence, TestFlight/App Store records, signing files, or internal release logs.
- Production environment files, credentials, private service configuration, or operator notes.
- Unreviewed animal-behavior learning drafts and internal source-candidate mappings. The public app keeps the related learning surface disabled until a separately reviewed content set is ready.
- Device-camera and AR experiment code or capture flows. Any future media or device-permission feature needs a separately reviewed spec.
- Private screenshots, analytics exports, or data that can identify a household or device.

Tests may use fictional fixtures only. Keep them in `app/tests/fixtures`, label them synthetic, and do not describe them as user research.

The app stores simulation progress on the user's device. Its optional remote feedback flow must remain disabled unless an operator separately supplies an endpoint and a public privacy notice. This repository does not provide or authorize a production backend. Any new collection, contact, analytics, camera, or retention behavior needs a maintainer-reviewed spec and privacy review before implementation.
