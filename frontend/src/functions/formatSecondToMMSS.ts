export function formatSecondToMMSS(ms: number): string {
  const mm = Math.floor(ms / 60);
  const ss = ('00' + Math.floor(ms % 60)).slice(-2);

  return `${mm}:${ss}`;
}
