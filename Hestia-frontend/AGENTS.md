# AGENTS.md

## Stack
- React 19 + Vite 8, JavaScript/JSX only (no TypeScript).
- Tailwind CSS 4 via `@tailwindcss/vite` (no `tailwind.config.js`, no PostCSS config).
- No tests, no typecheck script, no CI. The only quality gate is `npm run lint`.

## Commands
- `npm install` (lockfile: `package-lock.json`)
- `npm run dev` — Vite dev server with HMR
- `npm run lint` — ESLint flat config over `**/*.{js,jsx}`, ignores `dist`
- `npm run build` / `npm run preview`
- No single-test command exists; do not invent one.

## Tailwind quirk
- `@import 'tailwindcss';` is in `src/App.css` (imported by `src/App.jsx`), **not** `src/index.css`.
- `src/index.css` holds hand-written theme variables/base styles. Keep the Tailwind entry where it is or move it deliberately.

## Structure
- Entry: `index.html` -> `src/main.jsx` -> `src/App.jsx`.
- `src/assets/*` are imported as modules; `public/*` are referenced by absolute URL (e.g. `/icons.svg#id`).
- `README.md` is the untouched Vite template; it does not describe this project.

## Git gotcha (important)
- The git repo root is `C:\Users\Usuario` (your home directory), remote `SistemaZapato.git`, branch `main`.
- `Hestia-frontend/` is currently **untracked** (`?? ./`) and sibling projects are modified in the same repo.
- Never run repo-wide `git add`, `git commit -a`, or `git stash` from the home directory. Scope operations to this folder and confirm with the user before committing.
