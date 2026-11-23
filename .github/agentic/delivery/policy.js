const {isPlan, isTM} = require('../planner/revisions');
const {fingerprint} = require('../planner/guard');
const app = /^src\/main\/(?:java\/|resources\/(?:templates|static)\/)/;
const tests = /^src\/test\/java\/.+\.java$/;
const secret = /(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/;
function allowedPath(file) {
  return typeof file === 'string' && file.length < 256 &&
    file.split('/').every(part => /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(part));
}
function approval(issue, comments, appliedAt) {
  const plan = comments.filter(isPlan).at(-1);
  if (!plan || !plan.body.startsWith('<!-- raduna-piano-v1:' + issue.number + ':' + fingerprint(issue) + ' -->') ||
      !/^Stato: \*\*proposta\*\*/m.test(plan.body)) throw Error('Serve un piano corrente in stato proposta.');
  const pending = comments.some(c => c.id > plan.id && isTM(issue, c.user.login) && /^Rivedi il piano:/i.test(c.body));
  if (pending) throw Error('Una revisione del piano è ancora pendente.');
  const version = comments.filter(isPlan).length;
  const ok = comments.findLast(c => c.id > plan.id && isTM(issue, c.user.login) &&
    ['Approvo il piano ' + plan.html_url, 'Approvo il piano v' + version + ' ' + plan.html_url].includes(c.body.trim()) &&
    c.created_at <= appliedAt && c.updated_at <= appliedAt && plan.updated_at <= c.created_at);
  if (!ok) throw Error('Il TM assegnato deve commentare «Approvo il piano ' + plan.html_url + '» prima di applicare fase:implementazione.');
  const section = plan.body.split('\n### File e metodi\n')[1]?.split('\n### ')[0];
  const paths = (section || '').match(/src\/main\/[\w.\/-]+/g) || [];
  return {plan, ok, paths: paths.filter(p => allowedPath(p) && app.test(p))};
}
function validateResult(raw, role, approved) {
  if (Buffer.byteLength(raw) > 256 * 1024 || secret.test(raw)) throw Error('Risposta troppo grande o riservata.');
  let r;
  try { r = JSON.parse(raw); } catch { throw Error('Risposta Copilot non in formato JSON.'); }
  if (!r || !['pronto','bloccato'].includes(r.stato) || typeof r.rapporto !== 'string' ||
      !r.rapporto.trim() || r.rapporto.length > 12000 || !Array.isArray(r.files) || r.files.length > 20)
    throw Error('Formato del rapporto non valido.');
  const seen = new Set();
  for (const f of r.files) {
    if (!f || !allowedPath(f.path) || seen.has(f.path) || typeof f.content !== 'string' || !f.content.trim() ||
        !(role === 'implementatore' ? app.test(f.path) && approved.includes(f.path) : role === 'tester' && tests.test(f.path)))
      throw Error('Modifica fuori ambito o contenuto non valido.');
    seen.add(f.path);
  }
  if (r.stato === 'bloccato' && seen.size || r.stato === 'pronto' && role !== 'revisore' && !seen.size)
    throw Error('Stato incompatibile con i file proposti.');
  return r;
}
module.exports = {approval, validateResult, secret, isTM};
