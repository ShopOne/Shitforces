export default function getCookieArray() {
  const arr = [];
  if(document.cookie !== '') {
    const tmp = document.cookie.split('; ');
    for(let i = 0;i < tmp.length ; i++) {
      const data = tmp[i].split('=');
      arr[data[0]] = decodeURIComponent(data[1]);
    }
  }
  return arr;
}
