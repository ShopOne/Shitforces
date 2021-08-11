export const findContestIdFromPath = (): string => {
  const splitPath = window.location.pathname.split('/');
  const index = splitPath.indexOf('contest');
  if (index === -1 || index === splitPath.length) {
    throw new Error('pathにcontestを含んでいません');
  }

  return splitPath[index + 1];
};
