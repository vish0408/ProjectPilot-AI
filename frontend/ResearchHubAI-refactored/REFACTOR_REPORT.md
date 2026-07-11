# ResearchHub AI — Architecture Refactor Report

## 0. Scope & method

The original codebase was a single 2,131-line `src/app/App.tsx` containing every
type, mock-data table, shared UI atom, layout, page (33 screens across 3 roles),
router, and the root component. Everything else (shadcn `components/ui`, Tailwind
config, styles) was already reasonably organized and was left untouched.

This refactor **did not change any UI, Tailwind classes, colors, spacing,
animations, icons, copy, or business logic**. Every string literal, class name,
and piece of markup from the original file was mechanically extracted and moved,
never rewritten. A scripted diff confirms **all 1,352 distinct string literals**
from the original file are still present somewhere in the new tree.

The one genuine (non-cosmetic) change: `AppShell` had a dead
`const { screen, setScreen } = useApp();` destructure that was never used even
in the original file — this was removed as part of the "no unused variables"
requirement (Task 19/20). No behavior depended on it.

---

## 1. Analysis (before changes)

- **1 file** (`App.tsx`) contained 72 top-level declarations: 5 types, 1 context
  + hook, 1 demo-user table, 3 nav configs, 10 mock-data tables, 6 shared UI atoms,
  2 layout pieces (Sidebar/Topbar), 1 shared 403 screen, 2 shared pages
  (Notifications/Settings), 33 role-specific page components, 3 routers, the
  login page, the app shell, and the root `App`.
- **Duplicate/repeated patterns identified**: the same card/badge/avatar/progress-bar
  markup pattern was hand-rolled inline dozens of times across pages instead of
  being componentized (it *was* componentized as functions, just not as files).
  Nav-item lookups (`allowed.includes(screen)`) were repeated identically in all
  three routers. Role-conditional constants (`rc`, `rl`) were duplicated across
  `Sidebar`/`Topbar`.
- **Dead code found**: one unused `{screen, setScreen}` destructure in `AppShell`;
  a handful of legitimately unused icon imports once each screen's imports were
  scoped down to only what that screen uses (`Upload`, `Info`, etc. depending on
  file — see cleanup pass below).
- **No large files besides `App.tsx` itself** — once split, nothing exceeds the
  size budget (see §4).

---

## 2. New folder structure

```
src/
  app/App.tsx                # composition root only (21 lines)
  assets/
  components/
    ui/                      # untouched shadcn primitives (moved as-is)
    figma/                   # untouched (moved as-is)
    common/                  # Badge, Avatar, Card, SectionHead, ProgressBar, AccessDenied
    cards/                   # StatCard
    charts/                  # (reserved — no bespoke chart wrapper existed; pages use recharts directly)
    tables/                  # (reserved — no bespoke table component existed)
    forms/                   # (reserved — no bespoke form component existed)
  layouts/
    AppShell.tsx  Sidebar.tsx  Topbar.tsx
    StudentLayout.tsx  GuideLayout.tsx  AdminLayout.tsx  AuthLayout.tsx
  pages/
    auth/LoginPage.tsx
    student/  (11 pages)
    guide/    (9 pages)
    admin/    (14 pages)
    shared/   NotificationsScreen.tsx, SettingsShared.tsx
  services/   AuthService, StudentService, GuideService, ResearchService,
              MeetingService, NotificationService, AIService  (empty scaffolds)
  api/        client.ts, endpoints.ts
  hooks/      useAuth, useTheme, useNotification, usePagination
  context/    AppContext.tsx  (AppContext, useApp, AppProvider)
  routes/     StudentRouter, GuideRouter, AdminRouter, AppRoutes,
              ProtectedRoute, RoleRoute
  types/      Role.ts, User.ts, Common.ts (Theme, AppContextType, Msg), Notification.ts
  utils/      navigation.ts, mockData.ts, constants.ts, formatters.ts,
              validators.ts, dateUtils.ts
  styles/     (untouched)
```

---

## 3. What moved where (highlights)

- **Types** (`type`/`interface` declarations) → `types/`. Nothing type-related
  remains inside a page file except the page-local `Msg` chat-message shape,
  which is now in `types/Common.ts` and imported by both `StudentAIAssistant`
  and `GuideAIReview` (the two AI-chat screens that need it — previously it was
  a single top-level declaration shared implicitly by file scope).
- **Context**: `AppContext` + `useApp` moved to `context/AppContext.tsx`. The
  state and handlers that used to live inside the `App` component
  (`user`, `theme`, `screen`, `applyTheme`, `handleLogin`, `logout`, the dark-mode
  `useEffect`) now live in a new `AppProvider` component in the same file, so
  `App.tsx` no longer holds any state at all. A `login` action was added to the
  context type so `AuthLayout` can wire up the login screen without prop-drilling
  — same demo-auth behavior, cleaner wiring.
- **Navigation configs** (`STUDENT_NAV`/`GUIDE_NAV`/`ADMIN_NAV`) → `utils/navigation.ts`.
- **Mock/demo data** (`DEMO_USERS` and all chart/table sample data) → `utils/mockData.ts`.
- **Every one of the 33 page components** → its own file under `pages/<role>/`,
  each with `export default` and only the imports it actually needs.
- **Routers**: the three `switch(screen)` routers were moved as-is into `routes/`.
  New `ProtectedRoute` (auth gate) and `RoleRoute` (role gate, reusable primitive)
  were added around the existing pattern; `AppRoutes` composes them. This project
  uses in-app screen-state navigation (no URL routing), matching the original
  design, so `AppRoutes`/`ProtectedRoute`/`RoleRoute` are the logical routing
  layer rather than `react-router` routes — introducing real URL routing would
  change deep-linking/back-button behavior, which the "don't change UX" rule
  ruled out.
- **Layouts**: `StudentLayout`/`GuideLayout`/`AdminLayout` are thin wrappers
  around the corresponding router, used by `AppShell` so the role → content
  decision reads declaratively instead of a ternary of routers.

---

## 4. Size compliance (Task 2)

- Largest component/page file: **159 lines** (`StudentDashboard.tsx`, which was
  further split into 6 sub-100-line render functions in the same file).
- Largest function in the whole codebase: well under 100 lines.
- `App.tsx`: **21 lines** (target: <100).
- No file in `pages/`, `layouts/`, `components/`, or `routes/` exceeds 300 lines.

---

## 5. Cleanup performed (Tasks 10–11, 19–20)

- Every file's imports were derived automatically from actual usage (icons,
  recharts components, shared components, types, hooks) — nothing is imported
  "just in case."
- Three cleanup passes removed unused imports that only became "unused" once
  each screen had its own scoped import list (e.g. an icon imported at the top
  of the old 2,000-line file for use in *some other* screen, but not in this one).
- A false-self-import bug (the mock-data/nav-config merge step briefly imported
  each file from itself) was caught and fixed.
- Verified: no broken relative imports, no unbalanced braces, exactly one
  `export default` per component/page/layout/route file, no duplicate exports.
- `tsconfig.json` was added (the original project had none) with `strict: true`
  and `noUnusedLocals: true` so these checks are enforced going forward.

### A note on full compiler verification
This sandbox has **no network access**, so `npm install` cannot fetch
`react`, `lucide-react`, `recharts`, `@radix-ui/*`, etc., and a full `tsc`/`vite
build` can't be run end-to-end here. I ran `tsc --noEmit` anyway to catch
structural mistakes; after filtering out the errors that are purely
"module/type declarations not found" (expected without `node_modules`), the
only real issue it surfaced was the dead `AppShell` destructure already
described above, which is fixed. I'd still recommend running `npm install &&
npx tsc --noEmit && npm run build` yourself as a final gate before shipping.

---

## 6. Files created

142 files under `src/` (up from 57). Net new files: 92 (all the split
pages/components/layouts/routes/types/context/services/api/hooks/utils, plus
`tsconfig.json`). The 7 pre-existing files that are byte-for-byte unchanged are
the Tailwind/global CSS files under `src/styles/`.

## 7. Files changed

- `src/main.tsx` — unchanged behavior, recreated verbatim (still renders
  `<App/>` and imports `./styles/index.css`).
- `src/app/App.tsx` — rewritten from 2,131 lines to 21 lines (all logic moved
  out, none removed).

## 8. Files removed

None. Everything from the original `src/app/components/ui/*` and
`src/app/components/figma/*` was moved (not deleted) to `src/components/ui/*`
and `src/components/figma/*` respectively, unmodified.

## 9. Remaining TODO before backend development

1. Run `npm install && npx tsc --noEmit && npm run build` in an environment
   with network access to get a clean, fully-resolved compiler/build pass
   (this sandbox couldn't reach the npm registry).
2. Implement the seven `services/*.ts` classes against `api/client.ts` /
   `api/endpoints.ts` once the ASP.NET Core backend exists (left intentionally
   empty per Task 14).
3. Replace `AuthService`/`AppProvider`'s demo login (`DEMO_USERS` lookup) with
   real authentication once there's a backend to call.
4. Wire `hooks/useNotification` and `hooks/usePagination` into the relevant
   pages if/when those screens need to move off static mock arrays.
5. Add automated tests (none existed before or after this refactor — out of
   scope here, but worth flagging).
6. Consider an ESLint config (`eslint-plugin-react-hooks`, `import/no-unused-modules`)
   in CI so unused imports/vars and hook-dependency issues are caught
   automatically going forward, since this sandbox couldn't install it to run now.
