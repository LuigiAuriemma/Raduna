const fs = require('node:fs');

const fields = ['obiettivo', 'riferimenti', 'verifiche_modelli', 'file_metodi',
  'attivita', 'frame_esiti', 'criteri_accettazione', 'controlli', 'rischi',
  'limiti_proposti', 'decisioni_pendenti'];
const secret = /\b(?:github_pat_|gh[pousr]_|AKIA)[A-Za-z0-9_]{12,}\b/i;

function validate(raw, input) {
  if (Buffer.byteLength(raw, 'utf8') > 20000 || raw.length < 100) throw Error('Dimensione del piano non valida');
  const plan = JSON.parse(raw);
  if (!plan || Array.isArray(plan) || typeof plan !== 'object') throw Error('Il piano deve essere un oggetto JSON');
  if (!['proposta', 'bloccato'].includes(plan.stato)) throw Error('Stato non valido');
  for (const field of fields) {
    if (typeof plan[field] !== 'string' || !plan[field].trim() || plan[field].length > 3000) {
      throw Error(`Campo mancante o troppo lungo: ${field}`);
    }
  }
  if (secret.test(raw) || secret.test(input.issue.body)) throw Error('Possibile credenziale: pubblicazione bloccata');
  const headings = {
    obiettivo: 'Obiettivo', riferimenti: 'YouTrack, WP, requisito e fonti',
    verifiche_modelli: 'Verifiche dei modelli', file_metodi: 'File e metodi',
    attivita: 'Attività', frame_esiti: 'Test frame ed esiti',
    criteri_accettazione: 'Criteri di accettazione', controlli: 'Controlli',
    rischi: 'Rischi', limiti_proposti: 'Limiti proposti',
    decisioni_pendenti: 'Decisioni pendenti'
  };
  const body = [
    `<!-- raduna-piano-v1:${input.issue.number}:${input.fingerprint} -->`,
    ...(input.revision?.request ? [`<!-- richiesta-piano:${input.revision.request} -->`,
      `## Piano v${input.revision.version} — [richiesta del TM](https://github.com/${input.repository}/issues/${input.issue.number}#issuecomment-${input.revision.request})`] : ['## Piano proposto dal Pianificatore AI (v1)']),
    `Stato: **${plan.stato}**. Fonte: Issue #${input.issue.number}; commit ${input.source_sha}.`,
    ...fields.map(field => `### ${headings[field]}\n\n${plan[field].trim()}`),
    'Il TM assegnato deve verificare e approvare esplicitamente questo piano prima dell’implementazione.'
  ].join('\n\n');
  if (Buffer.byteLength(body, 'utf8') > 16000) throw Error('Commento troppo lungo');
  return body;
}

if (require.main === module) {
  try {
    const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
    const raw = fs.readFileSync(process.argv[3], 'utf8');
    fs.writeFileSync(process.argv[4], validate(raw, input), {mode: 0o600});
  } catch (error) {
    console.error(`Piano non pubblicabile: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = validate;
