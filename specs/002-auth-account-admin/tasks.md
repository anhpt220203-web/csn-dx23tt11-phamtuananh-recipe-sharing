---
description: "Dependency-ordered implementation tasks for account authentication and administration"
---

# Tasks: Đăng nhập và quản lý tài khoản

**Input**: Design documents from `specs/002-auth-account-admin/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/accounts.md`, `quickstart.md`

**Tests**: No test-writing tasks are included because the feature specification did not request a TDD/test-suite workflow. Independent acceptance criteria are listed for each story.

**Traceability**: Every implementation task names the related FR/NFR. Tasks without a user-story label are shared prerequisites or cross-cutting work.

## Phase 1: Setup and Scope Gate

**Purpose**: Align the official scope before any code or database migration.

- [X] T001 Review the existing SRS at `tmp/spec-recipe-website.md` as the scope source and synchronize FR4, the account-management extension of FR7, and demo-role distribution in NFR5 into `thesis/doc/SRS.md` per the user's later direction (Constitution I; FR4, FR7, NFR5).

---

## Phase 2: Foundational

**Purpose**: Add shared authentication and authorization support required by all stories. Do not start this phase until T001 is complete.

- [X] T002 Add Better Auth Admin fields `role`, `banned`, `banReason`, and `banExpires` to `src/prisma/schema.prisma`, create the corresponding migration under `src/prisma/migrations/`, and preserve existing Better Auth models (FR-004, FR-006, FR-009).
- [X] T003 Configure `src/lib/auth.ts` and `src/lib/auth-client.ts` for email/password, minimum password length 8, default role `user`, admin role, canonical lowercase email, official Prisma adapter dependency, and custom ACL denying all built-in admin management endpoints (FR-001–FR-004, FR-008–FR-009).
- [X] T004 Add a server-only session and role guard in `src/lib/account-admin-auth.ts` for protected account pages and routes; resolve role/status from trusted server-side state and reject guests and regular users (FR-008, NFR2).

**Checkpoint**: Schema, authentication defaults, least-privilege plugin ACL, and a reusable server authorization guard are ready.

---

## Phase 3: User Story 1 - Đăng ký và đăng nhập (Priority: P1) 🎯 MVP

**Goal**: A guest can register a regular account, sign in, and sign out with clear Vietnamese feedback.

**Independent Test**: Register a new account with a valid email and an 8+ character password, sign out, and sign in again; verify duplicate email, short password, invalid credentials, and a locked account are rejected, and new registration always receives `user` role.

### Implementation for User Story 1

- [X] T005 [P] [US1] Create the Vietnamese registration page and form in `src/app/dang-ky/page.tsx` and `src/components/auth/register-form.tsx`, with name/email/password validation and field-level errors for passwords under 8 characters (FR-001, FR-002, FR-005, FR-012).
- [X] T006 [P] [US1] Create the Vietnamese sign-in page and form in `src/app/dang-nhap/page.tsx` and `src/components/auth/login-form.tsx`, show localized invalid-credential/locked-account errors, and integrate Better Auth email sign-in/sign-out behavior (FR-003–FR-005, FR-012).
- [X] T007 [US1] Update `src/components/site/site-nav.tsx` to show signed-in state and a sign-out action, and link guests to registration/sign-in while preserving mobile navigation (FR-003, FR-005, FR-012).

**Checkpoint**: Registration, sign-in, sign-out, default user role, password minimum, and localized errors work without admin functionality.

---

## Phase 4: User Story 2 - Quản trị tài khoản (Priority: P2)

**Goal**: An administrator can find accounts and lock/unlock them; guests and regular users cannot access account data or operations.

**Independent Test**: With an admin session available, search for a regular account, lock it and confirm all sessions are revoked and sign-in is rejected; unlock it and confirm sign-in works again. Confirm a guest/user cannot access the page or routes, and the final active admin cannot be locked.

### Implementation for User Story 2

- [X] T008 [US2] Implement `src/services/account-admin-service.ts` to list accounts with 25 rows per page, search by name or email, and return only the allowed account DTO fields (FR-006–FR-008).
- [X] T009 [US2] Add lock/unlock operations to `src/services/account-admin-service.ts`; update `banned` and revoke every target session in a Prisma transaction, and reject any lock that would leave zero active admins (FR-004, FR-007–FR-009).
- [X] T010 [US2] Add server-guarded account list, lock, and unlock route handlers under `src/app/api/admin/accounts/`; validate input, call the account-admin service, return filtered DTOs, and map unauthorized/invalid/conflict errors to safe responses (FR-006–FR-009, NFR2).
- [X] T011 [US2] Create the server-protected account administration page in `src/app/admin/tai-khoan/page.tsx` and list/search controls in `src/components/admin/accounts/account-list.tsx`, displaying Vietnamese role and status labels (FR-006–FR-008, FR-012).
- [X] T012 [US2] Add empty-result, loading, and failed-operation feedback to `src/components/admin/accounts/account-list.tsx`; reflect the persisted status after lock/unlock errors and do not expose credential or session secrets (FR-005–FR-008, FR-012).

**Checkpoint**: Account administration is independently usable with an admin session; app routes enforce permissions on the server and plugin endpoints cannot bypass these limits.

---

## Phase 5: User Story 3 - Dùng tài khoản demo (Priority: P3)

**Goal**: Demo data contains usable admin and user accounts so each role can be presented.

**Independent Test**: Run the project seed in a demo environment; confirm at least five demo accounts exist, the admin credential reaches the management page, and the user credential is denied there.

### Implementation for User Story 3

- [X] T013 [P] [US3] Update `src/prisma/seed.ts` so repeated seeding maintains at least five demo users, assigns at least one dedicated demo admin and one regular demo user, creates credentials through Better Auth, and never logs passwords (FR-010–FR-011, NFR5).
- [X] T014 [P] [US3] Update `README.md` with demo sign-in instructions and the dedicated demo admin/user credentials, clearly label them as demo-only and not production credentials (FR-011, NFR5).

**Checkpoint**: Both demo roles can sign in and have the intended distinct permissions; rerunning seed preserves the role distribution.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete requirements that span registration, sign-in, and account administration.

- [X] T015 Ensure all new auth/admin messages, labels, empty states, and confirmation controls are Vietnamese and all pages/components in `src/app/dang-ky/`, `src/app/dang-nhap/`, and `src/app/admin/tai-khoan/` support 375px without horizontal scrolling (FR-005, FR-012, NFR3).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup and Scope Gate (Phase 1)**: T001 is complete; the existing source SRS was found at tmp/spec-recipe-website.md and its scope updates are recorded in thesis/doc/SRS.md.
- **Foundational (Phase 2)**: T002 → T003 → T004; blocks all user stories.
- **User Stories (Phase 3+)**: Begin after Phase 2. Recommended sequence is US1 → US2 → US3 by priority. US2 can be developed after the shared auth foundation but its demo acceptance scenario needs an admin account; US3 seed provides it.
- **Polish (Phase 6)**: Depends on the UI tasks in US1 and US2.

### User Story Dependencies

- **US1 (P1)**: Depends on T001–T004 only; no dependency on other stories. MVP.
- **US2 (P2)**: Depends on T001–T004; demo-based acceptance can use the account from US3 after seed is ready.
- **US3 (P3)**: Depends on T001–T003 and the final schema; independent of the auth/admin pages.

### Within Each User Story

- **US1**: T005 and T006 can run in parallel after T004; T007 follows both to connect the shared navigation state.
- **US2**: T008 → T009 → T010 → T011 → T012; service rules precede route exposure and UI integration.
- **US3**: T013 and T014 can run in parallel after T003 because they touch different files.

### Parallel Opportunities

- T005 with T006 after foundational work.
- T013 with T014 after foundational work.
- Other tasks are sequential where they modify the same service, route, or component files or depend on the preceding layer.

---

## Implementation Strategy

### MVP First

1. Complete T001–T004 (SRS gate and shared auth foundation).
2. Complete US1 (T005–T007) for a usable registration/sign-in MVP.
3. Complete US2 (T008–T012) to add account administration.
4. Complete US3 (T013–T014) to provision and document demo roles.
5. Complete T015 for Vietnamese and 375px cross-cutting requirements.

### Incremental Delivery

- US1 delivers account creation and email/password sign-in.
- US2 adds server-protected account search and lock/unlock with immediate session revocation.
- US3 adds idempotent demo accounts with distinct roles.
- Do not begin implementation until the official SRS has been updated per T001.

## Notes

- Every implementation task has an ID, applicable story label, exact source/document path, and FR/NFR traceability.
- No automated test-writing tasks are included because testing was not requested; acceptance criteria remain listed for each story.
- `[P]` is used only where files differ and prerequisites are complete.
- `tasks.md` does not replace the required `/speckit-analyze` review before implementation.
