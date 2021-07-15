export const createEnglishIndex = (index: number) => {
  const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const ALPHABETS_NUM = 26;
  let alpha = '';
  index++;
  while (index > 0) {
      index--;
      alpha += ALPHABETS[index % ALPHABETS_NUM];
      index = Math.floor(index / ALPHABETS_NUM);
  }
  return alpha.split('').reverse().join('');
};
