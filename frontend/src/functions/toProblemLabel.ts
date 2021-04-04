const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const memo: string[] = [];

export function toProblemLabel(index: number): string {
  if (memo[index] !== undefined) memo[index];

  let s = '';
  while (index >= 0) {
    s = ALPHABETS[index % ALPHABETS.length] + s;
    index = index / ALPHABETS.length - 1;
  }
  return (memo[index] = s);
}
