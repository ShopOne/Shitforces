const MAX_LENGTH = 20;
const MIN_LENGTH = 4;
const USABLE_PATTERN = /^[a-zA-Z0-9_-]+$/g;

export default function isValidAccountNameOrPassWord(text) {
  const matchRes = text.match(USABLE_PATTERN);
  const strLen = text.length;
  let res = true;
  if (matchRes === null) {
    res = false;
  }
  if (strLen < MIN_LENGTH || strLen > MAX_LENGTH) {
    res = false;
  }
  return res;
}
