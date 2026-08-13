import core, { getInput } from '@actions/core';
import { getOctokit } from '@actions/github';

(async () => {
  const token = getInput('github-token', { required: true })
  const checks = getInput('check', { required: true }).split("\n")
  const repo = getInput('repo', { required: true })
  const repoOwner = repo.split("/")[0]
  const repoName = repo.split("/")[1]
  const status = getInput('status', { required: true })
  const commit = getInput('commit', {required: true })
  const octokit = getOctokit(token)

  // Combined status holds only the latest state per context, so re-runs can't
  // bury a context's current state behind the full status history.
  const statuses = []
  for (let page = 1; ; page++) {
    const { data } = await octokit.repos.getCombinedStatusForRef({
      owner: repoOwner,
      repo: repoName,
      ref: commit,
      per_page: 100,
      page,
    });

    statuses.push(...data.statuses);
    if (data.statuses.length === 0 || statuses.length >= data.total_count) break;
  }

  let success = true;
  checks.forEach((check) => {
    const found = statuses.find((value) => value.context == check);

    if (found?.state != status) {
      success = false;
      console.log(`${check} has not successfully run. (expected '${status}', found '${found?.state ?? "no status"}')`);
    }
  });

  core.setOutput("success", success);
  if (!success) {
    core.setFailed("Not all checks have succeeded.");
  }
})().catch((error) => {
  console.error(error);
  core.setFailed(error.message);
});
