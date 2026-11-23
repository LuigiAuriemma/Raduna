const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const guard = require('./guard');
const validate = require('./validate');
const extract = require('./extract');
const publish = require('./publish');

const sample = {number: 42, title: 'Task', body: 'YouTrack: C16-42'};
const input = {issue: sample, repository: 'team/Raduna', source_sha: 'a'.repeat(40), fingerprint: guard.fingerprint(sample)};
const headings = ['Obiettivo', 'YouTrack, WP, requisito e fonti', 'Verifiche dei modelli', 'File e metodi',
  'Attività', 'Test frame ed esiti', 'Criteri di accettazione', 'Controlli', 'Rischi', 'Limiti proposti', 'Decisioni pendenti'];
const plan = 'Stato: **bloccato**' + headings.map(heading =>
  `\n\n### ${heading}\n\nRiferimento verificato o decisione richiesta.`).join('');

test('estrae solo la risposta finale da eventi Copilot completi', () => {
  const events = [
    {type: 'assistant.message', data: {phase: 'commentary', content: 'Verifico le fonti'}},
    {type: 'assistant.message', data: {phase: 'final_answer', content: plan}},
    {type: 'assistant.turn_end', data: {turnId: '0'}},
    {type: 'result', exitCode: 0}
  ];
  const raw = events.map(event => JSON.stringify(event)).join('\n');
  assert.match(validate(extract(raw), input), /Stato: \*\*bloccato\*\*/);
  assert.throws(() => validate(extract(events.map(event => JSON.stringify(event.type === 'assistant.message' && event.data.phase === 'final_answer' ? {...event, data: {...event.data, content: 'Verifico soltanto'}} : event)).join('\n')), input));
  assert.throws(() => extract(events.slice(0, -1).map(JSON.stringify).join('\n')));
  assert.throws(() => extract(events.slice(0, -2).concat({type: 'result', exitCode: 0}).map(JSON.stringify).join('\n')));
  assert.throws(() => extract(raw + '\n' + JSON.stringify(events[1])));
  assert.throws(() => extract(raw + '\n{troncato'));
  assert.throws(() => validate(extract(events.map(event => JSON.stringify(event.type === 'assistant.message' && event.data.phase === 'final_answer' ? {...event, data: {...event.data, content: plan.replace('Riferimento verificato o decisione richiesta.', '')}} : event)).join('\n')), input));
  assert.equal(extract([{type: 'session.start'}, ...events.slice(0, 1), {type: 'model.call_finished'}, ...events.slice(1, 3), {type: 'session.usage_checkpoint'}, events[3]].map(JSON.stringify).join('\n')), plan);
  assert.throws(() => extract([...events.slice(0, -1), {type: 'result', exitCode: 1}].map(JSON.stringify).join('\n')));
  assert.throws(() => extract([events[0], events[1], events[3], events[2]].map(JSON.stringify).join('\n')));
  assert.throws(() => extract([...events, events[3]].map(JSON.stringify).join('\n')));
});

test('il validatore accetta un blocco esplicito e rifiuta output incompleto o credenziali', () => {
  const body = validate(plan, input);
  assert.match(body, /Stato: \*\*bloccato\*\*/);
  assert.match(body, /approvare esplicitamente/);
  assert.throws(() => validate(plan.replace('### File e metodi', '### Mancante'), input));
  assert.throws(() => validate(plan + 'ghp_' + 'x'.repeat(30), input));
  assert.throws(() => validate(plan.replace('### File e metodi', '### File e metodi\n\nStato: **proposta**'), input));
  assert.throws(() => validate(plan.replace('### File e metodi', '<!-- richiesta-piano:7 -->\n### File e metodi'), input));
  assert.throws(() => validate(plan.replace('### File e metodi', '### File e metodi\n\n### File e metodi'), input));
  assert.throws(() => validate(plan.replace('### File e metodi', '### File e metodi\n\n# Titolo'), input));
  assert.throws(() => validate(plan + '\n\n### Extra\n\nTesto', input));
  assert.throws(() => validate(plan.replace('Riferimento verificato o decisione richiesta.', 'x'.repeat(3001)), input));
  assert.match(validate(plan.replace('Stato: **bloccato**', 'Stato: **proposta**'), input), /Stato: \*\*proposta\*\*/);
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
    fs.writeFileSync(path.join(tmp, 'planner-artifact/plan.md'), validate(plan, input));
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
