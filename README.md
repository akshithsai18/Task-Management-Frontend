# Daymark Task Management

A responsive React + Vite task manager prepared for a Java Spring Boot REST API. The frontend includes registration and login, protected routes, shared task state, dashboard statistics, task CRUD, search/filter/sort, and a clearly separated local mock service.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the URL printed by Vite. For a production bundle, run `npm run build`; `npm run preview` serves that bundle locally.

## Deploy to Vercel

The frontend repository includes `vercel.json` with an SPA rewrite, so direct visits and refreshes on routes such as `/tasks/123` resolve to the React app. Build settings for Vite are:

- Framework preset: Vite
- Root directory: `./` when importing the frontend-only repository
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

In Vercel, import the **frontend repository** (not the workspace/backend repository), then add this project environment variable for Production and Preview deployments:

```env
VITE_API_BASE_URL=https://your-deployed-backend.example.com/api
```

The backend URL must be public HTTPS in production. Production builds always use REST mode, even if `VITE_API_MODE=mock` is mistakenly configured; local Vite development continues to use mock mode by default. If the API URL is missing, requests show a configuration error rather than falling back to demo data. `VITE_` variables are bundled into public browser code, so never put credentials or signing secrets in them.

After deploying, add the exact Vercel site origin (for example, `https://your-project.vercel.app`) to the backend's `CORS_ALLOWED_ORIGINS`, alongside any other required frontend origins, and redeploy/restart the backend. Do not use `*`. If using Vercel preview URLs, explicitly allow the preview origins you need or test against a stable preview domain.

## API mode

The default `.env.example` selects `VITE_API_MODE=mock`. This uses `src/api/mockApi.js` and stores demo tasks in browser local storage. It is a development aid, not an authentication substitute and not backend data. The demo account is `alex.morgan@example.com` with password `Taskflow123!`; newly registered mock credentials remain in memory only and reset after a full page reload, so no password is written to browser storage.

To connect Spring Boot, set `VITE_API_MODE=rest` and `VITE_API_BASE_URL=http://localhost:8080/api`, then restart Vite. REST mode does not fall back to mock data if the backend is unavailable. API failures are shown to the user. The frontend currently expects:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Register with `{ name, email, password }` |
| POST | `/auth/login` | Login with `{ email, password }`; response `{ token, user }` |
| GET | `/auth/me` | Current authenticated user |
| GET | `/tasks` | Current user's tasks |
| GET | `/tasks/{id}` | One task |
| POST | `/tasks` | Create task |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |

Task JSON uses `{ id, title, description, priority, status, dueDate, createdAt, updatedAt }`. Priority values are `LOW`, `MEDIUM`, `HIGH`; status values are `PENDING`, `IN_PROGRESS`, `COMPLETED`. Adapt the small API service modules if the backend contract differs. The backend must enforce ownership and authorization for every task request.

### Authentication storage note

For this standalone project, a returned bearer token is kept in `sessionStorage`, never a password. This limits persistence to the browser tab session but does not protect a token from successful XSS. For production, prefer a backend-managed `HttpOnly`, `Secure`, `SameSite` cookie and add the CSRF protections appropriate to the deployment. Do not enable that cookie strategy on the frontend until the Spring Security backend supports it.

## Included flows

- Registration and login with validation, loading, and API errors
- Protected dashboard, task, and profile routes; logout and expired-session handling
- Create, view, edit, delete (with confirmation), complete, and reopen tasks
- Shared dashboard summaries, upcoming deadlines, completion progress, and priority distribution
- Search, status/priority filters, sorting, responsive task list, and empty states
- Profile details from the authenticated user; no invented profile update endpoint

## Manual test checklist

- [ ] Register a new mock user; check required fields, email format, and password confirmation.
- [ ] Log in with the demo account, refresh a protected page, then log out.
- [ ] Create a task and verify dashboard counts and task list update immediately.
- [ ] Search, filter, sort, edit, complete, reopen, view, and delete tasks.
- [ ] Check completed and pending views, due-soon panel, and no-results states.
- [ ] Try REST mode with the Spring server stopped and confirm the network error is visible rather than silently switching to mock data.
- [ ] Inspect desktop, tablet, and mobile widths; confirm navigation collapses and no horizontal overflow appears.
