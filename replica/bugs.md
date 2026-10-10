# Verified bugs

Only reproducible defects go here. Unverified compatibility and exact Pok Pok scene parity are tracked in `test-plan.md` and `features.csv`, not mislabeled as passed.

## Deployment blocker — GitHub Pages not enabled (external configuration)

- **Evidence:** GitHub Actions run `38060374679` failed at `actions/configure-pages@v5` with `Resource not accessible by integration` when creating the Pages site.
- **Expected:** Deployment workflow publishes the built static site.
- **Actual:** Pages site creation requires repository Pages source to be enabled by an administrator; the available GitHub app action cannot perform that setting change.
- **Resolution:** Select **Settings → Pages → Source: GitHub Actions**. Then rerun the deploy workflow. Not an application-code defect.

No reproduced app defects in the passing tests.
