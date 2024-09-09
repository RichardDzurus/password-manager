import { describe, expect, expectTypeOf, test } from 'vitest';
import { getRandomValue } from '../../src/lib/getRandomValue';

describe('getRandomValue', () => {
  test('result of a getRandomValue is a number', () => {
    expectTypeOf(getRandomValue()).toBeNumber();
  });

  test('getRandomValue with a max param of 0 throws an error', () => {
    expect(() => getRandomValue(0)).toThrowError();
  });

  test('getRandomValue with a max param of -1 throws an error', () => {
    expect(() => getRandomValue(-1)).toThrowError();
  });

  test('getRandomValue with a max param of higher than absolute max 0xffffffff + 1 fails', () => {
    const max = 0xffffffff + 1;
    expect(() => getRandomValue(max)).toThrowError();
  });

  test('result of a getRandomValue is restricted by a max', () => {
    const MAX = 5;
    expect(getRandomValue(MAX)).toBeLessThan(MAX);
  });
});
