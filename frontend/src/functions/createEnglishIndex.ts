const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ALPHABETS_NUM = 26;

// 問題のインデックスから問題名に変換する関数
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

// 問題名から問題のインデックスに変換する関数
export const decodeEnglishIndex = (problem: string): number => {
  let index = -1;
  for (let i = 0; i < problem.length; i++) {
    index = (index + 1) * ALPHABETS_NUM + problem.charCodeAt(i) - 65;
  }

  return index;
};
