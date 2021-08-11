interface CookieObject {
  [key: string]: string | undefined;
}

export function getCookie(): CookieObject {
  const cookieObject: CookieObject = {};
  if (document.cookie !== '') {
    const tmp = document.cookie.split('; ');
    for (let i = 0; i < tmp.length; i++) {
      const data = tmp[i].split('=');
      cookieObject[data[0]] = decodeURIComponent(data[1]);
    }
  }

  return cookieObject;
}
