export const isMobile = () => {
  if (
    window.matchMedia &&
    window.matchMedia('(max-device-width: 640px)').matches
  ) {
    return true;
  } else {
    return false;
  }
};
