const {comment, tag, branchName} = require('./state');
module.exports = async env => {
  const {github,context} = env, repo = context.repo;
  let number, sha, url, outcome;
  if (context.eventName === 'workflow_run') {
    const run = context.payload.workflow_run;
    const match = /^raduna\/issue-([1-9]\d*)$/.exec(run.head_branch);
    if (run.event !== 'pull_request' || !match ||
        run.head_repository?.full_name !== context.payload.repository.full_name) return;
    number = Number(match[1]); sha = run.head_sha; url = run.html_url; outcome = run.conclusion;
    const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt,
      {...repo,run_id:run.id,attempt_number:run.run_attempt,per_page:100});
    const verify = jobs.find(job => job.name === 'Maven verify (JDK 25)');
    if (!verify || verify.conclusion === 'skipped') return;
    outcome = verify.conclusion;
  } else {
    number = Number(process.env.ISSUE); sha = process.env.TEST_SHA;
    url = context.serverUrl + '/' + repo.owner + '/' + repo.repo + '/actions/runs/' + context.runId;
    outcome = process.env.OUTCOME;
  }
  const [pr] = (await github.rest.pulls.list({...repo, state:'open', base:context.payload.repository.default_branch,
    head:repo.owner + ':' + branchName(number)})).data;
  if (!pr || pr.user.login !== 'github-actions[bot]' || pr.head.sha !== sha) return;
  const notes = await github.paginate(github.rest.issues.listComments,{...repo,issue_number:number,per_page:100});
  if (!notes.some(c => c.user.login === 'github-actions[bot]' && c.body.startsWith('<!-- raduna-tester:'))) return;
  await github.rest.repos.createCommitStatus({...repo, sha, state:outcome === 'success' ? 'success' : 'failure',
    context:'Raduna / Maven verify', description:'Maven verify: ' + outcome, target_url:url});
  await comment(env,number,tag('ci',number),'## CI Maven — ' + outcome + '\n\nCommit `' + sha + '` · [Run e log](' + url + ') · [PR #' + pr.number + '](' + pr.html_url + ')');
};
