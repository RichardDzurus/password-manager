// Converts snake_case keys to camelCase
export const toCamelCase = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()), // Convert _ followed by a letter to uppercase letter
      value,
    ]),
  );
};

// Converts camelCase keys to snake_case
export const toSnakeCase = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), // Convert uppercase letters to _ + lowercase
      value,
    ]),
  );
};
