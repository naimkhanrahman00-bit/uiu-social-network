# Collaboration & Workflow Guidelines

This document outlines how we will work together on the UIU Social Network project using GitHub and AI assistants (Antigravity).

## Team Members & Roles
- **[Your Name]**: Admin/Lead
- **[Friend 1]**: Developer
- **[Friend 2]**: Developer

## Core Workflow: The "AI Handoff" Loop

Since we are using fresh AI instances for each session, **Context Preservation is Critical**.

1.  **PULL**: Always start by pulling the latest changes.
    ```bash
    git pull origin main
    ```

2.  **READ & RESTORE CONTEXT**:
    - Open `DEV_NOTES.md`: Read the "Current Status" and "Next Steps" left by the previous person.
    - Open `task.md`: See what tasks are claimed or in progress.
    - **Prompt the AI**: When starting a new AI session, tell it:
        > "We are working on the UIU Social Network. Please read `prd.md`, `schema.md`, `task.md`, and `DEV_NOTES.md` to understand the current state."

3.  **WORK**:
    - Pick a task from `task.md` or `prd.md`.
    - Mark it as "In Progress" in `task.md`.
    - Implement the feature/fix.

4.  **UPDATE CONTEXT (Crucial!)**:
    - Before you finish, update `DEV_NOTES.md`.
        - What did you accomplish?
        - What is half-done?
        - Any new environment variables added?
        - Any database schema changes made?
    - Update `task.md` (mark items `[x]`).

5.  **PUSH**:
    ```bash
    git add .
    git commit -m "feat: implemented [feature] and updated context"
    git push origin main
    ```

## Development Standards

### Branching
- Use `main` for stable code.
- Create feature branches if working on complex features: `feature/lost-and-found` or `fix/auth-bug`.

### Code Style
- Use clear variable names.
- Comment complex logic.
- **No hardcoded secrets**: Use `.env` files (and share them via secure channel, NOT git).

### Database
- If you change the schema, update `schema.md`.
- If you add a new table, add the SQL command to `database.sql` or a migration file.

## AI Interaction Tips
- If the AI seems lost, refer it back to `prd.md`.
- If you make a design decision that deviates from the PRD, **Update the PRD**. The PRD is our "Source of Truth".
