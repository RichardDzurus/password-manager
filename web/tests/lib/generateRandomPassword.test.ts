import { describe, expect, expectTypeOf, test } from 'vitest';
import { generateRandomPassword } from '../../src/lib/generateRandomPassword';

describe('generateRandomPassword', () => {
  test('result of a generateRandomPassword is a string', () => {
    expectTypeOf(generateRandomPassword(10)).toBeString();
  });

  test('generateRandomPassword with a length param of 0 throws an error', () => {
    expect(() => generateRandomPassword(0)).toThrowError();
  });

  test('generateRandomPassword with a length param of -1 throws an error', () => {
    expect(() => generateRandomPassword(-1)).toThrowError();
  });

  test('result of a generateRandomPassword with a length param has the expected number of chars', () => {
    const LENGTH = 32;
    expect(generateRandomPassword(LENGTH).length).toEqual(LENGTH);
  });

  test('generateRandomPassword contains characters from all groups', () => {
    const GROUPS = {
      lowercase: true,
      uppercase: true,
      numbers: true,
      specialCharacters: true,
      spaces: true,
    };
    const CONFIG = { groups: GROUPS, forceFromEachGroup: true };

    const password = generateRandomPassword(32, CONFIG);

    // Check for at least one lowercase letter
    expect(password).toMatch(/[a-z]/);

    // Check for at least one uppercase letter
    expect(password).toMatch(/[A-Z]/);

    // Check for at least one number
    expect(password).toMatch(/[0-9]/);

    // Check for at least one special character (adjust based on what characters you allow)
    expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);

    // Check for at least one space character
    expect(password).toMatch(/ /);
  });

  test('generateRandomPassword contains characters from all groups except spaces', () => {
    const GROUPS = {
      lowercase: true,
      uppercase: true,
      numbers: true,
      specialCharacters: true,
      spaces: false,
    };
    const CONFIG = { groups: GROUPS, forceFromEachGroup: true };

    const password = generateRandomPassword(32, CONFIG);

    // Check for at least one lowercase letter
    expect(password).toMatch(/[a-z]/);

    // Check for at least one uppercase letter
    expect(password).toMatch(/[A-Z]/);

    // Check for at least one number
    expect(password).toMatch(/[0-9]/);

    // Check for at least one special character (adjust based on what characters you allow)
    expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);

    // Check that it does not have a space character
    expect(password).not.toMatch(/ /);
  });

  test('generateRandomPassword contains only alphanumeric chars', () => {
    const GROUPS = {
      lowercase: true,
      uppercase: true,
      numbers: true,
      specialCharacters: false,
      spaces: false,
    };
    const CONFIG = { groups: GROUPS, forceFromEachGroup: true };

    const password = generateRandomPassword(32, CONFIG);

    // Check for at least one lowercase letter
    expect(password).toMatch(/[a-z]/);

    // Check for at least one uppercase letter
    expect(password).toMatch(/[A-Z]/);

    // Check for at least one number
    expect(password).toMatch(/[0-9]/);

    // Check that it does not have a special character
    expect(password).not.toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);

    // Check that it does not have a space character
    expect(password).not.toMatch(/ /);
  });
});
