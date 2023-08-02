const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
  const token = core.getInput('github-token', { required: true })
  const checks = core.getInput('check', { required: true }).split("\n")
  const repo = core.getInput('repo', { required: true })
  const repoOwner = repo.split("/")[0]
  const repoName = repo.split("/")[1]
  const status = core.getInput('status', { required: true })
  const branch = core.getInput('branch', {required: true })
  const octokit = new github.getOctokit(token)
  
  const commitStatuses = await octokit.repos.listCommitStatusesForRef({ owner: repoOwner, repo: repoName, ref: branch, per_page: 100 })
  const commitChecks = await octokit.checks.listForRef({ owner: repoOwner, repo: repoName, ref: branch, per_page: 100 })

  let success = true
  checks.forEach(check => {
    const hasCommitStatus = commitStatuses.data ? commitStatuses.data.some((value) => value.context == check && value.state == status) : false
    const hasCommitCheck = commitChecks.data.check_runs ? commitChecks.data.check_runs.some((value) => value.name === 'Confirm checks passed' || (value.name === check && value.conclusion === status)) : false

    if (!hasCommitStatus || !hasCommitCheck) {
      success = false
      console.log(`${check} has not successfully run.`)
    }
  })

  core.setOutput("success", success);
  if (!success) {
    core.setFailed('Not all checks have succeeded.')
  }
  
})().catch(error => {
  console.error(error)
  core.setFailed(error.message)
})