# Account Management Contracts

**Feature**: `002-auth-account-admin`

These are application behavior contracts. Authentication/session APIs remain behind the existing Better Auth catch-all handler. Account administration routes are application-owned and must authorize every request on the server. Better Auth built-in admin management endpoints are denied by the plugin ACL so callers cannot bypass application transaction guards or response filtering.

## Authentication

| User action | Contract | Result |
|---|---|---|
| Register | `POST /api/auth/sign-up/email` with `name`, `email`, `password` | Creates `role=user`; rejects invalid email, duplicate canonical email, and password shorter than 8 characters. Never accepts a caller-supplied elevated role. |
| Sign in | `POST /api/auth/sign-in/email` with `email`, `password` | Creates a database-backed session for an active account; rejects invalid credentials and locked accounts. |
| Sign out | `POST /api/auth/sign-out` | Revokes the current session. |

Successful auth responses must not expose password hashes or credential-account secrets. Errors displayed in the UI are localized to Vietnamese.

## Administrator account list

`GET /api/admin/accounts?q=<search>&page=<page>`

- Requires a valid session whose server-resolved role is `admin`.
- Search is optional and matches name or email; results are paginated at 25 accounts per page.
- Returns only `id`, `name`, `email`, `role`, `status`, and display-safe timestamps if present.
- Does not return password/hash, account provider tokens, session token, ban internals, or private environment data.
- Guest/user requests return 401/403 and no account records.

## Lock account

`POST /api/admin/accounts/{userId}/lock`

- Requires a valid server-checked admin session.
- Rejects a missing user and any request that would leave zero active admins.
- On success, atomically sets the target account locked and revokes every session belonging to it.
- Repeated lock request is idempotent; response reflects locked state.

## Unlock account

`POST /api/admin/accounts/{userId}/unlock`

- Requires a valid server-checked admin session.
- Clears lock status; does not create a session or sign in the user.
- Repeated unlock request is idempotent; response reflects active state.

## Out of scope

No admin operations for changing roles, deleting accounts, changing email/password, impersonation, or inspecting session tokens. Built-in plugin routes for these operations must be denied by the plugin ACL or otherwise unavailable.