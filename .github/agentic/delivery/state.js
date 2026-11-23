const {approval, isTM} = require('./policy');
const {createHash} = require('node:crypto');
const bot = c => c.user?.login === 'github-actions[bot]';
const branchName = n => 'raduna/issue-' + n;
const tag = (role, key) => '<!-- raduna-' + role + ':' + key + ' -->';

async function snapshot({github, context}, role, number) {
  const repo = context.repo;
  const issues = github.rest.issues;
  const {data: issue} = await issues.get({...repo, issue_number: number});
  const labels = issue.labels.map(l => l.name);
  if (issue.pull_request || issue.state !== 'open' || !labels.includes('task-agente') ||
      !labels.includes('fase:implementazione')) throw Error('Issue fuori dalla fase di implementazione.');
  if (role === 'tester' && !labels.includes('fase:test')) throw Error('Label fase:test assente.');
  const {data: access} = await github.rest.repos.getCollaboratorPermissionLevel({...repo, username: context.actor});
  if (!['admin','maintain','write'].includes(access.permission) || !isTM(issue, context.actor))
    throw Object.assign(Error('Il comando richiede il TM assegnato alla Issue con accesso Write.'), {unauthorized:true});
  const comments = await github.paginate(issues.listComments, {...repo, issue_number: number, per_page: 100});
  const events = await github.paginate(issues.listEvents, {...repo, issue_number: number, per_page: 100});
  const labelEvent = events.findLast(e => e.event === 'labeled' && e.label?.name === 'fase:implementazione');
  if (!labelEvent || !isTM(issue, labelEvent.actor.login)) throw Error('Applicare fase:implementazione come TM assegnato.');
  const {plan, ok, paths} = approval(issue, comments, labelEvent.created_at);
  const branch = branchName(number);
  const base = context.payload.repository.default_branch;
  const prs = (await github.rest.pulls.list({...repo, head: repo.owner + ':' + branch, base, state: 'all'})).data;
  const pr = prs.find(p => p.head.repo?.full_name === issue.repository_url.split('/repos/').pop());
  if (pr && (pr.state !== 'open' || !pr.draft || pr.user.login !== 'github-actions[bot]')) throw Error('La PR del task deve essere aperta, in bozza e creata dal workflow.');
  if (!pr && role !== 'implementatore') throw Error('Draft PR del task assente.');
  const sha = pr?.head.sha || (await github.rest.repos.getBranch({...repo, branch: base})).data.commit.sha;
  const key = role === 'implementatore' ? String(plan.id) : sha;
  const done = comments.find(c => bot(c) && c.body.startsWith(tag(role, key)));
  const payload = {issue: {number, title: issue.title, body: issue.body}, plan: plan.body,
    planUrl: plan.html_url, approvalUrl: ok.html_url};
  if (role === 'tester') {
    if (!comments.some(c => bot(c) && c.body.startsWith('<!-- raduna-revisore:'))) throw Error('Attendere il rapporto del Revisore sulla Draft PR.');
    // Only the task specifications and the TM-provided test brief enter the tester session.
    delete payload.plan;
    payload.testBrief = pr.body?.split('## Input per il Tester')[1] || '';
  }
  const stamp = createHash('sha256').update(JSON.stringify([role, sha, plan.body, ok.id, ok.body, payload])).digest('hex');
  const receiptTag = tag(role + '-commit', plan.id + '-' + ok.id);
  const receipt = comments.findLast(c => bot(c) && c.body.startsWith(receiptTag + '\n'));
  const saved = receipt?.body.split('\n');
  const pending = saved && /^[a-f0-9]{40}$/.test(saved[1]) && /^[a-f0-9]{40}$/.test(saved[2]) &&
    (role === 'implementatore' && !pr || role === 'tester' && (sha === saved[1] || sha === saved[2])) ?
    {parent:saved[1], head:saved[2], report:saved.slice(3).join('\n')} : null;
  return {number, base, branch, pr, sha, paths, key, done, stamp, payload, comments, receiptTag, pending};
}
async function comment(env, number, marker, text) {
  const {github, context} = env;
  const args = {...context.repo, issue_number: number};
  const items = await github.paginate(github.rest.issues.listComments, {...args, per_page: 100});
  const old = items.find(c => bot(c) && c.body.startsWith(marker));
  const body = marker + '\n' + text;
  if (old && old.body !== body) return (await github.rest.issues.updateComment({...context.repo, comment_id: old.id, body})).data;
  if (old) return old;
  return (await github.rest.issues.createComment({...args, body})).data;
}
module.exports = {snapshot, comment, tag, branchName};
