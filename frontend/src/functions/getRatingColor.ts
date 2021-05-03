export const getRatingColor = (rating: number): string => {
  let rateColor = '';
  if (rating === 0) {
    rateColor = 'black';
  } else if (rating < 400) {
    rateColor = 'gray';
  } else if (rating < 800) {
    rateColor = 'brown';
  } else if (rating < 1200) {
    rateColor = 'green';
  } else if (rating < 1600) {
    // cyan
    rateColor = '#00C0C0';
  } else if (rating < 2000) {
    rateColor = 'blue';
  } else if (rating < 2400) {
    // yellow
    rateColor = '#C0C000';
  } else if (rating < 2800) {
    rateColor = 'orange';
  } else {
    rateColor = 'red';
  }
  return rateColor;
};
