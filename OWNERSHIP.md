# Ownership and integrity

**Owner:** [YOUR NAME] ([YOUR EMAIL]). Copyright (c) 2026.

## Lock the game as yours (one time)
1. `node tools/seal.js keygen` creates `owner.key` (your secret, never committed, back it up offline) and `owner.pub`.
2. After every change you approve: `node tools/seal.js seal`, then commit `integrity.json` and `owner.pub`.
3. The server refuses to host if any game file differs from your signed seal (`ALLOW_MODIFIED=1` bypasses it for local development only), and the `verify` workflow fails on GitHub. Only the holder of `owner.key` can produce a valid seal.
4. On GitHub: make the repo **private** if only you should access it, edit `.github/CODEOWNERS` with your username, and under Settings > Branches add a rule requiring pull requests, code-owner review, restricted pushes and signed commits.

## Limits, honestly
The seal proves which builds are yours; it cannot stop someone copying files they can already read. The LICENSE is MIT, which lets anyone copy and modify the code. If you want to keep rights, replace it with an all-rights-reserved notice (a lawyer can advise), and keep the repo private. Keep `owner.key` safe: if it is lost you can only re-key, and if it leaks anyone can sign.
