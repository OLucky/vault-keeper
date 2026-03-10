# Commit and Push Changes

Commit all staged and unstaged changes, then push to the remote repository using the GitHub Personal Access Token from `.env`.

## Process

1. Read the `GITHUB_PERSONAL_ACCESS_TOKEN` from the `.env` file in the project root
2. Run `git status` to review changes
3. Run `git diff` to understand what changed (both staged and unstaged)
4. Run `git log --oneline -5` to check recent commit message style
5. Stage all relevant changes (prefer specific files over `git add -A`)
6. Draft a concise commit message summarizing the changes — focus on the "why", not the "what"
7. Create the commit with:
   ```
   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```
8. Push to the remote using the token:
   ```bash
   git remote set-url origin https://x-access-token:${TOKEN}@github.com/OWNER/REPO.git
   git push
   ```
   Extract OWNER/REPO from the existing remote URL.
9. Restore the original remote URL (without the token) after pushing
10. Report the commit hash and confirm the push succeeded

## Rules

- NEVER commit files that contain secrets (`.env`, credentials, tokens)
- NEVER force push
- If there are no changes to commit, say so and stop
- If a pre-commit hook fails, fix the issue and create a NEW commit (do not amend)
- Always use a HEREDOC for the commit message to preserve formatting
- If the user provides arguments, use them as the commit message or guidance
