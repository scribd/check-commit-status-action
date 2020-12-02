# Check Commit Status Action

GitHub Action to confirm commit statuses are their expected values.

## Inputs

### `check`

**Required** The status check(s) to validate.

### `status`

The expected status. Can be 'error', 'failure', 'pending' or 'success'. *Default value:* 'success'

## Example usage

```yaml
- name: Confirm Tests Passed
  uses: justAnotherDev/check-commit-status-action@v1
  with:
    check: |
      Run Unit Tests
      Run Snapshot Tests
```
