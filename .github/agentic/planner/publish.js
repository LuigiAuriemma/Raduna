const fs = require('node:fs');
const path = require('node:path');
const {fingerprint, labels, marker} = require('./guard');

module.exports = async ({github, context, core}) => {
  const n = context.issue.number;
  const input = JSON.parse(fs.readFileSync(path.join(process.env.RUNNER_TEMP, 'planner-artifact/input.json'), 'utf8'));
  const body = fs.readFileSync(path.join(process.env.RUNNER_TEMP, 'planner-artifact/plan.md'), 'utf8');
  if (input.issue.number !== n || input.repository !== `${context.repo.owner}/${context.repo.repo}` ||
      input.fingerprint !== fingerprint(input.issue) || !body.startsWith(`${marker}${n}:${input.fingerprint} -->`)) {
    core.setFailed('Artefatto del piano incoerente.');
    return;
  }
  const {data: issue} = await github.rest.issues.get({...context.repo, issue_number: n});
  const names = labels(issue);
  if (issue.state !== 'open' || issue.pull_request || !names.includes('task-agente') ||
      !names.includes('fase:piano') || names.includes('fase:implementazione') ||
      fingerprint(issue) !== input.fingerprint) {
    core.setFailed('Issue o fase cambiata: piano non pubblicato.');
    return;
  }
  const comments = await github.paginate(github.rest.issues.listComments, {...context.repo, issue_number: n, per_page: 100});
  if (comments.some(c => c.user?.login === 'github-actions[bot]' && (c.body || '').startsWith(marker))) {
    core.notice('Piano già pubblicato.');
    return;
  }
  await github.rest.issues.createComment({...context.repo, issue_number: n, body});
  core.notice('Piano pubblicato sulla Issue.');
};
