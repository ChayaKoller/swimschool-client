# SwimSchool client

React 19 + TypeScript + Vite + Tailwind CSS v4 client for the SwimSchool .NET API. Hebrew, RTL. Real client, deployed to Render as a Static Site.

## Structure
- `src/api/types.ts`: mirrors the server DTOs exactly. Enums are strings ("Maccabi", "Group"...). Update it when a DTO changes.
- `src/api/client.ts`: the only place that calls fetch. Adds the JWT, turns `ErrorResponse` into `ApiError`, and logs out on 401.
- `src/api/endpoints.ts`: one function per API call.
- Server state uses TanStack Query (query keys: 'groups', 'group', 'students', 'student', 'reports', 'report-settings'). Invalidate after every mutation.
- Colors live only in `src/index.css` (@theme). Use the tokens (brand, water, leaf, berry...), never raw hex in components.

## Rules
- All UI text in Hebrew. Use logical classes (ms-/me-/ps-/pe-/start/end), not left/right.
- Show server error messages as they are (they are already Hebrew). Show traceId on unexpected errors.
- Dates: server lesson times are UTC, show them in Asia/Jerusalem (src/lib/format.ts). DateOnly values ("2026-10-19") are never converted.
- No secrets in the client. The API address comes from VITE_API_URL (production) or the Vite proxy (development).
- Work in the steps given in the prompt. Before each step, list the planned files briefly and WAIT for approval.
- Do NOT commit. The developer commits herself.
