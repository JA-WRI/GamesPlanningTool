const currentYear = new Date().getFullYear();

// allowed years: this year to 10 years ahead
// TODO: get this from the Games planning dates later
export const ALLOWED_YEAR_RANGE = {
  min: currentYear,
  max: currentYear + 10,
};
