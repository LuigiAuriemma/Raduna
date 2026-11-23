const isPlan = c => c.user?.login === 'github-actions[bot]' && c.body?.startsWith('<!-- raduna-piano-v1:');
const isTM = (issue, login) => issue.assignees?.some(a => a.login.toLowerCase() === login?.toLowerCase());
const command = /^Rivedi il piano:\s*\S/i;

function revision(issue, comments, event) {
  const plans = comments.filter(isPlan);
  if (!event) return plans.length ? null : {};
  const previous = plans.at(-1);
  const request = comments.find(c => c.id === event.id);
  if (!previous || !request || !isTM(issue, request.user.login) || !command.test(request.body) ||
      request.body !== event.body || request.id <= previous.id ||
      plans.some(c => c.body.includes('<!-- richiesta-piano:' + event.id + ' -->'))) return null;
  return {version: plans.length + 1, request: request.id, feedback: request.body, previous: previous.body, previousId: previous.id};
}
module.exports = {revision, isPlan, isTM};
