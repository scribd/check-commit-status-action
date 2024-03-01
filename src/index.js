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

  const commitStatuses = await octokit.repos.listCommitStatusesForRef({
    owner: repoOwner,
    repo: repoName,
    ref: commit,
    per_page: 100,
  });

  let success = true;
  checks.forEach((check) => {
    const hasRequiredCheckStatus =
      commitStatuses.data?.some(
        (value) => value.context == check && value.state == status
      ) ?? false;

    if (!hasRequiredCheckStatus) {
      success = false;
      console.log(`${check} has not successfully run.`);
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
