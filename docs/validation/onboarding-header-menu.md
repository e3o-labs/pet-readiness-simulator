# Header guide menu

Base: public main 869a9e43558946ed7699a98a4fa6c3e8ed88011c (TestFlight build 8 source).

The shared application header now exposes 교육 콘텐츠, 온보딩 다시 보기, and the existing 의견 보내기 action. The header wraps on narrow screens and all new buttons have a minimum height of 44 points.

Onboarding replay is a four-step read-only guide covering the service, household conditions, practice profiles, and daily care/reflection. It opens in a dismissible native Modal and returns to the underlying screen. It does not write application state, reset progress, change the selected profile, or clear reflection drafts. This is a replay of guidance; existing household editing remains in the profile flow.

Education opens a preparation notice. The education runtime gate remains false and the public card array remains empty; no unreviewed lessons or illustrations are included in this change.

Validation: full app test suite, web export, public boundary check, and git diff whitespace check passed. Browser UI confirmed all four replay steps, completion returning to the service introduction, and the education preparation notice. iPhone Simulator/device validation and a new TestFlight upload have not been performed.
