const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ALPHABETS_NUM = 26;

export const createEnglishIndex = (index: number): string => {
  let alpha = '';
  index++;
  while (index > 0) {
    index--;
    alpha += ALPHABETS[index % ALPHABETS_NUM];
    index = Math.floor(index / ALPHABETS_NUM);
  }

  return alpha.split('').reverse().join('');
};
export const createEnglishString = (problem: string): number => {
  let index = 0;
  for (let i = 0; i < problem.length; i++) {
    index = index * ALPHABETS_NUM + problem.charCodeAt(i) - 65;
  }

  return index;
};
