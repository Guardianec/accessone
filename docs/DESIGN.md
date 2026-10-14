# AccessOne interface specification

Direction: Swiss enterprise onboarding, with a warm neutral canvas, a narrow process rail, fine rules, and a single forest-green accent. The interface earns trust through consistency; the copy gradually stops deserving that trust.

Typography: locally bundled Manrope Variable for interface text and IBM Plex Mono for technical labels. The desktop layout uses a 305px process rail and a fluid work area capped at 688px. At 600px the rail becomes a compact horizontal indicator. Controls are at least 43–47px tall; forms and assessments stack on narrow viewports.

Tokens live in `src/styles.css`: raw primitives → semantic aliases → button and input tokens. The 6px default radius, 4px spacing rhythm, restrained borders, and intentional heading scale stay consistent across all 24 stages. The access diagram is CSS and a simple geometric brand mark; there are no remote images or decorative stock assets.

Motion: 180ms control feedback, 300ms page entrance, continuous status feedback during timed work. Reduced-motion preferences disable visual animation without extending any process. A native dialog provides modal focus management and Escape behavior. Every drag operation has a tap and keyboard alternative.

Pacing: 36 reflective assessment statements, two profile sections, privacy/consent decisions, short interactive verification tasks, and a finite 30-second finale. Aim for 8–15 minutes of normal participation; speed readers can finish sooner. There are no artificial minimum dwell times on questionnaire answers. A real participant timing study is still needed to validate the estimate.

Skills applied: frontend-design; ui-ux-pro-max (Swiss minimalism, accessible controls and responsive guidance; marketing layout and blue palette recommendations rejected as unsuitable); design-system (three-layer CSS tokens); ponytail (static, small dependencies, no backend); Sites (source and deployment workflow). The computer-use skill was inspected; Playwright is the selected browser testing tool, so native Windows automation is unnecessary.
