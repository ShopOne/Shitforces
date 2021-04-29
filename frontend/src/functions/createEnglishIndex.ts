export const createEnglishIndex = (index: number, max_width: number) => {
  if (index > max_width)
    throw new Error('インデックスは総問題数以下の数であるべきです');

  const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const ALPHABETS_NUM = 26;
  let alph = ALPHABETS[index % ALPHABETS_NUM];
  if (max_width > ALPHABETS_NUM && index >= ALPHABETS_NUM) {
    alph += Math.floor(index / ALPHABETS_NUM);
  }
  return alph;
};
