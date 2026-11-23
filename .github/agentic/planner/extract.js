const fs = require('node:fs');

function extract(raw) {
  const lines = raw.trim().split(/\r?\n/);
  let final;
  let finalTurn;
  let turnEnded = false;
  let result;
  for (const line of lines) {
    const event = JSON.parse(line);
    if (event.type === 'assistant.message' && event.data?.phase === 'final_answer') {
      if (final !== undefined || result) throw Error('Risposta finale ambigua');
      final = event.data.content;
      finalTurn = event.data.turnId;
    }
    if (event.type === 'assistant.turn_end') {
      if (result || turnEnded) throw Error('Chiusura del turno ambigua');
      if (final !== undefined && (finalTurn === undefined || event.data?.turnId === finalTurn)) turnEnded = true;
    }
    if (event.type === 'result') {
      if (!turnEnded || result) throw Error('Risultato Copilot ambiguo');
      result = event;
    }
  }
  if (typeof final !== 'string' || !final.trim() || !turnEnded || !result || result.exitCode !== 0) {
    throw Error('Risposta finale Copilot assente o esecuzione incompleta');
  }
  return final;
}

if (require.main === module) {
  try {
    fs.writeFileSync(process.argv[3], extract(fs.readFileSync(process.argv[2], 'utf8')), {mode: 0o600});
  } catch (error) {
    console.error(`Output Copilot non estraibile: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = extract;
