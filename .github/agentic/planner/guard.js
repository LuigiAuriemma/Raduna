const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {revision} = require('./revisions');

const marker = '<!-- raduna-piano-v1:';
const labels = issue => issue.labels.map(label => typeof label === 'string' ? label : label.name);
const fingerprint = issue => crypto.createHash('sha256').update(JSON.stringify([issue.number, issue.title, issue.body || ''])).digest('hex');

module.exports = async ({github, context, core}) => {
  const n = context.issue.number;
  const {data: issue} = await github.rest.issues.get({...context.repo, issue_number: n});
  const names = labels(issue);
  if (issue.pull_request || issue.state !== 'open' || !names.includes('task-agente') ||
      !names.includes('fase:piano') || names.includes('fase:implementazione')) {
    core.notice('Issue fuori dalla fase di pianificazione.');
    return;
  }
  if (/\b(?:github_pat_|gh[pousr]_|AKIA)[A-Za-z0-9_]{12,}\b/i.test(issue.body || '')) {
    core.setFailed('Possibile credenziale nella Issue: input non inviato a Copilot.');
    return;
  }
  const {data: permission} = await github.rest.repos.getCollaboratorPermissionLevel({
    ...context.repo, username: context.actor
  });
  if (!['write', 'maintain', 'admin'].includes(permission.permission)) {
    core.setFailed('La label fase:piano richiede un membro con accesso Write.');
    return;
  }
  const comments = await github.paginate(github.rest.issues.listComments, {...context.repo, issue_number: n, per_page: 100});
  const update = revision(issue, comments, context.payload?.comment);
  if (/\b(?:github_pat_|gh[pousr]_|AKIA)[A-Za-z0-9_]{12,}\b/i.test(update?.feedback || '')) {
    core.setFailed('Possibile credenziale nel feedback: input non inviato a Copilot.');
    return;
  }
  if (!update) {
    core.notice('Piano presente oppure richiesta di revisione non applicabile.');
    return;
  }
  const input = {issue: {number: n, title: issue.title, body: issue.body || ''},
    revision: update, repository: context.repo.owner + '/' + context.repo.repo,
    source_sha: context.sha, fingerprint: fingerprint(issue)};
  const output = path.join(process.env.RUNNER_TEMP, 'raduna-planner-input.json');
  fs.writeFileSync(output, JSON.stringify(input), {mode: 0o600});
  core.setOutput('run', 'true');
  core.setOutput('fingerprint', input.fingerprint);
};

module.exports.fingerprint = fingerprint;
module.exports.marker = marker;
module.exports.labels = labels;
