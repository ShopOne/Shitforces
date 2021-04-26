export function getContestId() {
  const splitPath = window.location.pathname.split('/');
  return splitPath.slice(-1)[0];
}
