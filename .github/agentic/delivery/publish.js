const fs = require('node:fs');
const path = require('node:path');
const {snapshot, tag, comment} = require('./state');
const {validateResult} = require('./policy');

async function prepareCommit(env, s, files, role, report) {
  const {github, context} = env;
  const git = github.rest.git, repo = context.repo;
  const parent = (await git.getCommit({...repo, commit_sha:s.sha})).data;
  const tree = (await git.getTree({...repo, tree_sha:parent.tree.sha, recursive:'1'})).data;
  if (tree.truncated) throw Error('Albero Git incompleto.');
  const entries = new Map(tree.tree.map(e => [e.path,e]));
  for (const f of files) {
    const existing = entries.get(f.path);
    if (existing && (existing.mode !== '100644' || role === 'tester')) throw Error('Percorso protetto o test preesistente.');
    for (let dir = path.posix.dirname(f.path); dir !== '.'; dir = path.posix.dirname(dir)) {
      if (entries.has(dir) && entries.get(dir).type !== 'tree') throw Error('Directory non ordinaria.');
    }
  }
  const newTree = (await git.createTree({...repo, base_tree: parent.tree.sha,
    tree: files.map(f => ({path:f.path, mode:'100644', type:'blob', content:f.content}))})).data;
  if (newTree.sha === parent.tree.sha) throw Error('La proposta non contiene modifiche.');
  const message = 'Raduna #' + s.number + ' — ' + role + '\n\nPiano: ' + s.payload.planUrl + '\nApprovazione: ' + s.payload.approvalUrl;
  const commit = (await git.createCommit({...repo, message, tree:newTree.sha, parents:[s.sha]})).data;
  // Persist the exact commit before moving a ref, so a retry can finish a partial delivery.
  await comment(env,s.number,s.receiptTag,[s.sha,commit.sha,report].join('\n'));
  return {parent:s.sha,head:commit.sha,report};
}

async function deliverCommit(env, s, role, saved) {
  const git = env.github.rest.git, repo = env.context.repo, ref = 'heads/' + s.branch;
  let current;
  try { current = (await git.getRef({...repo,ref})).data.object.sha; }
  catch (error) { if (error.status !== 404) throw error; }
  if (current === saved.head) return;
  if (role === 'implementatore' && !current) {
    await git.createRef({...repo,ref:'refs/' + ref,sha:saved.head});
  } else if (role === 'tester' && current === saved.parent) {
    await git.updateRef({...repo,ref,sha:saved.head,force:false});
  } else throw Error('Il branch è cambiato: interrompo la consegna.');
}

module.exports = async env => {
  const {core, github, context} = env;
  const role = process.env.ROLE, number = Number(process.env.ISSUE);
  const run = context.serverUrl + '/' + context.repo.owner + '/' + context.repo.repo + '/actions/runs/' + context.runId;
  const reportFailure = reason => comment(env, number, tag(role + '-blocco', context.runId),
    '**' + role + ' bloccato.** ' + reason + ' [Esecuzione](' + run + ')');
  try {
    if (process.env.JOB_RESULT !== 'success') {
      await reportFailure(process.env.REASON || 'Controllare la fase fallita nella run.');
      core.setFailed('Generazione non completata.');
      return;
    }
    const s = await snapshot(env, role, number);
    if (role === 'implementatore' && s.pr) {
      if (!s.done) await comment(env,number,tag(role,s.key),'Draft PR disponibile: ' + s.pr.html_url);
      core.setOutput('pr',s.pr.number);
      return;
    }
    if (s.done) {
      if (role === 'tester') core.setOutput('sha',s.sha);
      return;
    }
    if (!s.pending && s.stamp !== process.env.STAMP) throw Error('Input o commit cambiati durante la generazione.');
    const r = s.pending ? {stato:'pronto', rapporto:s.pending.report} :
      validateResult(fs.readFileSync(path.join(process.env.RUNNER_TEMP,'result','result.json'),'utf8'),role,s.paths);
    if (r.stato === 'bloccato') {
      await reportFailure(r.rapporto);
      if (s.pr) await comment(env,s.pr.number,tag(role + '-blocco',context.runId),r.rapporto);
      return;
    }
    let pr = s.pr, head = s.sha;
    if (role !== 'revisore') {
      const saved = s.pending || await prepareCommit(env,s,r.files,role,r.rapporto);
      await deliverCommit(env,s,role,saved);
      head = saved.head;
    }
    if (role === 'implementatore') {
      pr = (await github.rest.pulls.create({...context.repo, base:s.base, head:s.branch, draft:true,
        title:('[Raduna] ' + s.payload.issue.title).slice(0,220),
        body:'Issue #' + number + '\n\nPiano: ' + s.payload.planUrl + '\n\nApprovazione TM: ' + s.payload.approvalUrl +
        '\n\n' + r.rapporto + '\n\n## Input per il Tester\nIl TM può inserire qui gli estratti approvati e le firme pubbliche.'})).data;
      core.setOutput('pr',pr.number);
    }
    const marker = tag(role,role === 'tester' ? head : s.key);
    const body = '## ' + role + '\n\nCommit `' + head + '`\n\n' + r.rapporto;
    const note = await comment(env,pr.number,marker,body);
    await comment(env,number,marker,body + '\n\n[Dettagli sulla PR](' + note.html_url + ')');
    if (role === 'tester') core.setOutput('sha',head);
  } catch(e) {
    await reportFailure('Verificare lo stato della Issue, del branch e della PR.');
    throw e;
  }
};
