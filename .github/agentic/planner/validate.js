const fs = require('node:fs');

const headings = ['Obiettivo', 'Riferimenti e fonti', 'Verifiche dei modelli',
  'File e metodi', 'Attività', 'Test frame ed esiti', 'Criteri di accettazione',
  'Controlli', 'Rischi', 'Limiti proposti', 'Decisioni pendenti'];
const secret = /\b(?:github_pat_|gh[pousr]_|AKIA)[A-Za-z0-9_]{12,}\b/i;

function validate(raw, input) {
  if (Buffer.byteLength(raw, 'utf8') > 20000 || raw.length < 100) throw Error('Dimensione del piano non valida');
  if (secret.test(raw) || secret.test(input.issue.body)) throw Error('Possibile credenziale: pubblicazione bloccata');
  const normalized = raw.replace(/\r\n/g, '\n').trim();
  const lines = normalized.split('\n');
  if (lines.some(line => /^\s*Stato:|<!--|-->|^#{1,2}\s/.test(line))) {
    throw Error('Intestazione o marcatore non consentito');
  }
  const sections = [];
  let cursor = 0;
  for (const heading of headings) {
    const expected = `### ${heading}`;
    while (lines[cursor] === '') cursor++;
    if (lines[cursor++] !== expected) throw Error(`Sezione mancante o fuori ordine: ${heading}`);
    const body = [];
    while (cursor < lines.length && !/^###\s/.test(lines[cursor])) body.push(lines[cursor++]);
    const content = body.join('\n').trim();
    if (!content || content.length > 3000 || /<!--|-->|^#{1,3}\s|^Stato:/m.test(content)) {
      throw Error(`Sezione non valida: ${heading}`);
    }
    sections.push(`${expected}\n\n${content}`);
  }
  if (cursor !== lines.length) throw Error('Contenuto dopo le sezioni');
  const body = [
    `<!-- raduna-piano-v1:${input.issue.number}:${input.fingerprint} -->`,
    ...(input.revision?.request ? [`<!-- richiesta-piano:${input.revision.request} -->`,
      `## Piano v${input.revision.version} — [richiesta del TM](https://github.com/${input.repository}/issues/${input.issue.number}#issuecomment-${input.revision.request})`] : ['## Piano proposto dal Pianificatore AI (v1)']),
    `Fonte: Issue #${input.issue.number}; commit ${input.source_sha}.`,
    ...sections,
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
