const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const guard = require('./guard');
const validate = require('./validate');
const publish = require('./publish');

const sample = {number: 42, title: 'Task', body: 'YouTrack: C16-42'};
const input = {issue: sample, repository: 'team/Raduna', source_sha: 'a'.repeat(40), fingerprint: guard.fingerprint(sample)};
const plan = Object.fromEntries(['obiettivo', 'riferimenti', 'verifiche_modelli', 'file_metodi', 'attivita',
  'frame_esiti', 'criteri_accettazione', 'controlli', 'rischi', 'limiti_proposti', 'decisioni_pendenti']
  .map(key => [key, 'Riferimento verificato o decisione richiesta.']));
plan.stato = 'bloccato';

test('il validatore accetta un blocco esplicito e rifiuta output incompleto o credenziali', () => {
  const body = validate(JSON.stringify(plan), input);
  assert.match(body, /Stato: \*\*bloccato\*\*/);
  assert.match(body, /approvare esplicitamente/);
  assert.throws(() => validate(JSON.stringify({...plan, file_metodi: ''}), input));
  assert.throws(() => validate(JSON.stringify({...plan, obiettivo: 'ghp_' + 'x'.repeat(30)}), input));
});

test('il guard evita una seconda chiamata Copilot', async () => {
  const outputs = {};
  const core = {setOutput: (k, v) => {outputs[k] = v;}, notice: () => {}, setFailed: e => {throw Error(e);}};
  const github = {rest: {
    issues: {get: async () => ({data: {...sample, state: 'open', labels: [{name: 'task-agente'}, {name: 'fase:piano'}]}}),
      listComments: async () => ({data: [{user: {login: 'github-actions[bot]'}, body: '<!-- raduna-piano-v1:42:old -->'}]})},
    repos: {getCollaboratorPermissionLevel: async () => ({data: {permission: 'write'}})}
  }, paginate: async fn => (await fn()).data};
  await guard({github, context: {issue: {number: 42}, repo: {owner: 'team', repo: 'Raduna'}, actor: 'tm'}, core});
  assert.equal(outputs.run, undefined);
});

test('il guard rifiuta una Issue con credenziale prima della chiamata AI', async () => {
  let accessChecked = false;
  let failure = '';
  const github = {rest: {issues: {get: async () => ({data: {...sample, body: 'ghp_' + 'x'.repeat(30), state: 'open', labels: ['task-agente', 'fase:piano']}})},
    repos: {getCollaboratorPermissionLevel: async () => {accessChecked = true;}}}};
  await guard({github, context: {issue: {number: 42}, repo: {owner: 'team', repo: 'Raduna'}, actor: 'tm'},
    core: {setFailed: e => {failure = e;}, notice: () => {}}});
  assert.match(failure, /credenziale/);
  assert.equal(accessChecked, false);
});

test('la pubblicazione si ferma quando la Issue cambia', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'raduna-planner-'));
  const oldTemp = process.env.RUNNER_TEMP;
  try {
    process.env.RUNNER_TEMP = tmp;
    fs.mkdirSync(path.join(tmp, 'planner-artifact'));
    fs.writeFileSync(path.join(tmp, 'planner-artifact/input.json'), JSON.stringify(input));
    fs.writeFileSync(path.join(tmp, 'planner-artifact/plan.md'), validate(JSON.stringify(plan), input));
    let published = false;
    let failure = '';
    const github = {rest: {issues: {
      get: async () => ({data: {...sample, body: 'testo cambiato', state: 'open', labels: ['task-agente', 'fase:piano']}}),
      createComment: async () => {published = true;}
    }}};
    await publish({github, context: {issue: {number: 42}, repo: {owner: 'team', repo: 'Raduna'}},
      core: {setFailed: e => {failure = e;}, notice: () => {}}});
    assert.match(failure, /cambiata/);
    assert.equal(published, false);
  } finally {
    process.env.RUNNER_TEMP = oldTemp;
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});
