import { getRandomValue } from './getRandomValue';

export type CharacterGroupKeys = 'lowercase' | 'uppercase' | 'numbers' | 'spaces' | 'specialCharacters';

type OptionGroups = Partial<Record<CharacterGroupKeys, boolean>>;

export type PasswordOptions = {
  groups?: OptionGroups;
  forceFromEachGroup?: boolean;
};

const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  groups: {
    lowercase: true,
    uppercase: true,
    numbers: true,
    spaces: false,
    specialCharacters: true,
  },
  forceFromEachGroup: true,
};

const LOWERCASE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARACTERS = '0123456789';
const SPECIAL_CHARACTERS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SPACE_CHARACTER = ' ';

const CHARACTER_GROUPS = {
  lowercase: LOWERCASE_CHARACTERS,
  uppercase: UPPERCASE_CHARACTERS,
  numbers: NUMBER_CHARACTERS,
  specialCharacters: SPECIAL_CHARACTERS,
  spaces: SPACE_CHARACTER,
};

// Type guard for valid character group keys
const isCharacterGroupKey = (key: string): key is CharacterGroupKeys => {
  return key in CHARACTER_GROUPS;
};

const getAllPossibleCharacters = (possbileGroups: OptionGroups): string => {
  let allPossibleCharacters = '';
  Object.entries(possbileGroups).forEach(([key, value]) => {
    if (!value || !isCharacterGroupKey(key)) return;
    allPossibleCharacters += CHARACTER_GROUPS[key];
  });
  return allPossibleCharacters;
};

// return a single character from each selected group
const getForcedCharacters = (possibleGroups: OptionGroups): string => {
  let forcedCharacters = '';
  Object.entries(possibleGroups).forEach(([key, value]) => {
    if (!value || !isCharacterGroupKey(key)) return;

    const randomIndex = getRandomValue(CHARACTER_GROUPS[key].length);
    const character = CHARACTER_GROUPS[key][randomIndex];
    forcedCharacters += character;
  });
  return forcedCharacters;
};

// Shuffle function to randomize character order
const shuffle = (string: string): string => {
  const array = string.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomValue(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
};

export const generateRandomPassword = (length: number, passwordOptions = DEFAULT_PASSWORD_OPTIONS): string => {
  if (length <= 0) {
    throw new Error('Password length must be greater than 0');
  }

  const userGroups = passwordOptions.groups ?? {};
  const mergedGroups = { ...DEFAULT_PASSWORD_OPTIONS.groups, ...userGroups };
  const mergedOptions = { ...DEFAULT_PASSWORD_OPTIONS, ...passwordOptions, groups: mergedGroups };
  const allPossibleCharacters = getAllPossibleCharacters(mergedOptions.groups);

  if (!allPossibleCharacters) {
    throw new Error('No character groups selected');
  }
  const numOfGroups = Object.values(mergedOptions.groups).filter(Boolean).length;
  if (mergedOptions.forceFromEachGroup && numOfGroups > length) {
    throw new Error('Number of groups is greater than the password length');
  }

  let password = '';
  if (mergedOptions.forceFromEachGroup) {
    password += getForcedCharacters(mergedOptions.groups);
  }
  while (password.length < length) {
    const randomIndex = getRandomValue(allPossibleCharacters.length);

    const character = allPossibleCharacters[randomIndex];
    password += character;
  }

  return shuffle(password.slice(0, length));
};
