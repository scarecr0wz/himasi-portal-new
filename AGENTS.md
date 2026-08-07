# AI Assistant Guidelines

Welcome to the `himasi-portal` project. Please follow these strict guidelines when interacting with the user's requests:

## Project Name
Call this project as "HIMASI Portal". Do not use other names for this project.

## 1. Strictly Follow Instructions
- **Do exactly what is asked.** Do not assume that additional steps are required unless explicitly commanded.
- If the user asks to "edit the UI", **only** edit the UI files (React, CSS, TSX, etc.).

## 2. Prohibited Actions (Unless Explicitly Requested)
Do **NOT** do any of the following on your own accord without a direct, explicit command from the user:
- ❌ **Do not run tests** (e.g., `jest`, `vitest`, etc.).
- ❌ **Do not run build commands** (e.g., `npm run build`).
- ❌ **Do not update the changelog** (`changelog.md` or similar files).

## 3. When to Perform Additional Actions
- Only run tests, build the project, or update changelogs if the user explicitly says something like: *"update the changelog"*, *"run the build"*, or *"test this code"*.

## 4. Scope and Context
- Keep your changes minimal and scoped only to the files required to fulfill the user's specific request.
- Avoid over-engineering solutions. Keep it simple and focused on the immediate task.

## 5. Efficiency and Speed (No Yapping)
- **Code over explanation:** Provide the code directly. Do not write long paragraphs explaining how standard frameworks (Node, React, Tailwind) work unless explicitly asked.
- **Provide specific changes only:** Only output the exact code blocks or functions that need to change rather than generating the entire file, unless the full file context is absolutely necessary.
- **No assumptions on dependencies:** If a package or library is needed, just inform the user instead of automatically running `npm install` or `composer require`.
- **Format respons singkat:** Jawab langsung tanpa preamble ("Oke, saya akan...") dan tanpa ringkasan/penjelasan panjang setelah selesai mengedit. Setelah pekerjaan selesai, berhenti.

## 6. Tech Stack Conventions
- Follow the existing project patterns (backend: Node.js + Hono + Prisma; frontend: React + TypeScript + Vite + Tailwind CSS v4).
- Do not introduce new libraries, frameworks, or structural patterns without asking first.
- When editing UI, reuse existing components and standard Tailwind classes rather than writing custom raw CSS (unless instructed otherwise).

## 7. No Over-exploration & No Touching Docs
- **Limit your search radius:** Do not run global searches (`grep`, `rg`, `Get-Content`) on folders like `tests/`, `docs/`, or `changelog.md` unless explicitly instructed.
- **Do not update documentation:** Never modify files in the `docs/` folder, `README.md`, or project plans unless the user explicitly asks for documentation updates.
- **Stop when the goal is met:** Once the specific files (e.g., UI or backend route) are updated, do not look for "related" tests or documentation to update. Finish the turn immediately.

By adhering to these rules, you ensure a smoother, faster workflow without unnecessary delays from unrequested actions.

## 8. Kliring Kalau Ambigu

- **Tanyakan dulu sebelum eksekusi:** Jika instruksi ambigu, atau ada pilihan desain besar / trade-off yang signifikan, tanyakan pertanyaan klarifikasi singkat terlebih dahulu daripada menebak.
- **Jangan menebak scope:** Jika tidak jelas file/fitur mana yang diminta, konfirmasi dulu sebelum mulai mengubah kode.

## 9. Git Commit and Update Changelog

- When instructed to create a Git commit, use the existing commit message convention already used in this repository (e.g. `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
- Do NOT push to any remote branch (e.g. `main` or `production`) unless you are explicitly instructed to do so.
