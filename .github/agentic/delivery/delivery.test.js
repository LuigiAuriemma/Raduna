const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {approval,validateResult} = require('./policy');
const {fingerprint} = require('../planner/guard');
const {revision} = require('../planner/revisions');
const {snapshot} = require('./state');
const publish = require('./publish');
const report = require('./ci-report');
const tm = {login:'tm'}, bot = {login:'github-actions[bot]'};
const issue = {number:3,repository_url:'https://api.github.com/repos/team/Raduna',assignees:[tm],
  labels:['task-agente','fase:implementazione','fase:test'].map(name => ({name})), state:'open', title:'Titolo',body:'UC'};
const appFile = 'src/main/java/example/App.java';
const plan = {id:11,html_url:'https://github.com/team/Raduna/issues/3#issuecomment-11',user:bot,updated_at:'1',
  body:'<!-- raduna-piano-v1:3:' + fingerprint(issue) + ' -->\nStato: **proposta**.\n### File e metodi\n\n' + appFile};
const ok = {id:12,user:tm,created_at:'2',updated_at:'2',html_url:'approval',body:'Approvo il piano ' + plan.html_url};

test('richiesta del TM, ultima versione e ordine approvazione/label', () => {
  const request = {id:13,user:tm,body:'Rivedi il piano: aggiungi eccezioni'};
  assert.equal(revision(issue,[plan,request],request).version,2);
  assert.equal(revision(issue,[plan,{...request,user:bot}],request),null);
  assert.throws(() => approval(issue,[plan,ok,request],'3'));
  assert.throws(() => approval(issue,[plan,ok],'1'));
  assert.throws(() => approval(issue,[plan,{...ok,user:bot}],'3'));
  assert.deepEqual(approval(issue,[plan,ok],'3').paths,[appFile]);
  assert.throws(() => approval(issue,[plan,ok,{...plan,id:14,html_url:'new'}],'4'));
});

test('il revisore non propone file e i test non escono da src/test/java', () => {
  const result = p => JSON.stringify({stato:'pronto',rapporto:'ok',files:[{path:p,content:'class X {}'}]});
  assert.throws(() => validateResult(result(appFile),'revisore',[]));
  assert.throws(() => validateResult(result(appFile),'tester',[]));
  assert.throws(() => validateResult(result('src/test/java/../../main/X.java'),'tester',[]));
  assert.throws(() => validateResult(result(appFile),'implementatore',[]));
});

test('consegna simulata: Draft PR, revisione, test sullo stesso branch e stato CI per SHA', async t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(),'raduna-flow-'));
  t.after(() => fs.rmSync(temp,{recursive:true,force:true}));
  fs.mkdirSync(path.join(temp,'result'));
  const outputs = {}, notes = {3:[plan,ok],8:[]}, statuses = [];
  let pr, ref, commits=0;
  const github = {rest:{
    issues:{get:async()=>({data:issue}),listComments:'comments',listEvents:'events',
      createComment:async({issue_number,body})=>{const c={id:100+notes[issue_number].length,user:bot,body,html_url:'link'};notes[issue_number].push(c);return {data:c};},
      updateComment:async({comment_id,body})=>{const c=notes[3].find(x=>x.id===comment_id);c.body=body;return {data:c};}},
    repos:{getCollaboratorPermissionLevel:async()=>({data:{permission:'write'}}),getBranch:async()=>({data:{commit:{sha:'a'.repeat(40)}}}),
      createCommitStatus:async data=>statuses.push(data)},
    pulls:{list:async()=>({data:pr?[pr]:[]}),create:async({head,draft,body})=>{
      assert.equal(head,'raduna/issue-3');assert.equal(draft,true);
      pr={number:8,draft,body,user:bot,state:'open',html_url:'pr',head:{sha:ref,repo:{full_name:'team/Raduna'}}};return {data:pr};}},
    git:{getCommit:async()=>({data:{tree:{sha:'old'}}}),getTree:async()=>({data:{tree:[]}}),
      createTree:async()=>({data:{sha:'tree'}}),createCommit:async()=>({data:{sha:String(++commits).repeat(40)}}),
      getRef:async()=>{if(!ref)throw Object.assign(Error(),{status:404});return {data:{object:{sha:ref}}};},
      createRef:async({sha})=>{ref=sha;},updateRef:async({sha,force})=>{assert.equal(force,false);ref=sha;pr.head.sha=sha;}}
  },paginate:async(fn,args)=>fn==='events'?[{event:'labeled',label:{name:'fase:implementazione'},actor:tm,created_at:'3'}]:notes[args.issue_number]};
  const env={github,core:{setOutput:(k,v)=>outputs[k]=v,setFailed:assert.fail},context:{repo:{owner:'team',repo:'Raduna'},
    actor:'tm',serverUrl:'https://github.com',runId:10,payload:{repository:{default_branch:'main'}}}};
  Object.assign(process.env,{RUNNER_TEMP:temp,ISSUE:'3',JOB_RESULT:'success'});
  for (const [role,files] of [['implementatore',[{path:appFile,content:'class App {}'}]],['revisore',[]],
      ['tester',[{path:'src/test/java/AppTest.java',content:'class AppTest {}'}]]]) {
    process.env.ROLE=role;
    process.env.STAMP=(await snapshot(env,role,3)).stamp;
    fs.writeFileSync(path.join(temp,'result/result.json'),JSON.stringify({stato:'pronto',rapporto:role,files}));
    await publish(env);
  }
  assert.equal(outputs.pr,8);assert.equal(outputs.sha,ref);assert.equal(commits,2);
  await publish(env);assert.equal(commits,2);
  process.env.TEST_SHA=ref;process.env.OUTCOME='success';
  await report(env);assert.equal(statuses[0].sha,ref);
  assert.ok(notes[3].some(c=>c.body.startsWith('<!-- raduna-ci:3')));
  process.env.TEST_SHA='b'.repeat(40);await report(env);assert.equal(statuses.length,1);
});
