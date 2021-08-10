export const getRatingColor = (rating: number): string => {
  if (rating === 0) {
    return 'black';
  } else if (rating < 400) {
    return 'gray';
  } else if (rating < 800) {
    return 'brown';
  } else if (rating < 1200) {
    return 'green';
  } else if (rating < 1600) {
    // cyan
    return '#00C0C0';
  } else if (rating < 2000) {
    return 'blue';
  } else if (rating < 2400) {
    // yellow
    return '#C0C000';
  } else if (rating < 2800) {
    return 'orange';
  } else {
    return 'red';
  }
};
