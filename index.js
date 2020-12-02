const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
  const token = core.getInput('github-token', { required: true })
  const commit = core.getInput('commit', { required: true })
  const checks = core.getInput('check', { required: true }).split("\n")
  const repo = core.getInput('repo', { required: true })
  const status = core.getInput('status', { required: true })
  const branch = core.getInput('branch', {required: true })
  const octokit = new github.getOctokit(token)
  
  const response = await octokit.actions.listWorkflowRunsForRepo({
    owner: repo.split("/")[0],
    repo: repo.split("/")[1],
    branch: branch,
    status: 'success'
  })

  core.debug(response.data.workflow_runs)

  const runsForCommit = response.data.workflow_runs.filter((value, index, array) => value.head_sha == commit)

  let success = true
  checks.forEach(check => {
    if (!runsForCommit.some((value, index, array) => value.name == check)) {
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