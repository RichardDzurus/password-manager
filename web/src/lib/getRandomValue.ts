// get Random Value in the range [0, max) while the max value is less than or equal to 0xffffffff.
// it is used to avoid modulo bias.
export const getRandomValue = (max: number = 0xffffffff): number => {
  // Validation: Ensure `max` is a positive number and within the acceptable range.
  if (max <= 0) {
    throw new Error('Max value must be greater than 0');
  }
  if (max > 0xffffffff) {
    throw new Error('Max value must be less than or equal to 0xffffffff');
  }

  // Calculate maxValidRandomValue to avoid modulo bias.
  const maxValidRandomValue = Math.floor(0xffffffff / max) * max;
  let value: number | null = null;

  // Generate random values until one is within the valid range.
  while (value === null || value >= maxValidRandomValue) {
    const array = new Uint32Array(1); // Generate a secure random 32-bit integer.
    window.crypto.getRandomValues(array);
    value = array[0];
  }

  // Return the random value within the range [0, max)
  const randomValue = value % max;
  return randomValue;
};
