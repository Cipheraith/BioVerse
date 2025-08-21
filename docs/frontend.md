# Frontend (React + Vite + TS)

Vite React app with Tailwind, i18n, Firebase auth, and rich visualization.

## Structure
- `src/App.tsx`: routing and protected routes
- `src/components/**`: UI components incl. dashboards, charts, video, layout
- `src/pages/**`: feature pages (telemedicine, health twins, settings)
- `src/contexts/**`: auth and app contexts
- `src/services/**`: API clients
- `src/i18n.ts`: localization setup
- `src/firebase.ts`: Firebase config

## Routing
- Public: `/`, `/login`, `/register`, `/about`, `/docs`, `/contact`, `/support`, `/privacy`, `/api`
- Protected: `/dashboard`, `/luma`, `/telemedicine`, `/dispatch-map`, `/analytics`, `/patients`, `/appointments`, `/health-twins`, etc.
- Role-based protection via `ProtectedRoute` and `allowedRoles`.

## Environment
Create `client/.env` with:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Dev
```bash
cd client
npm run dev
```

## Build & Preview
```bash
npm run build
npm run preview
```

## Testing
```bash
npm test
```
