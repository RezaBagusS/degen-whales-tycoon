# Git Branching & Workflow Rules

1. **Development Branch (`dev`):**
   - All new features, bug fixes, UI adjustments, and code changes MUST be committed and tested on the `dev` branch first.
   - Never commit directly to `main` during feature development or experimentation.

2. **Testing & Validation:**
   - Changes must be tested on `dev` (verifying functionality, typecheck, and server health).
   - The user must test and verify changes on `dev` before promoting to production.

3. **Release to Production (`main`):**
   - Merging `dev` into `main` is ONLY done after the user confirms that the changes on `dev` are safe, stable, and ready.
   - Both `dev` and `main` must maintain the exact same quality standard and clean working tree.
