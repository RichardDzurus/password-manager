import { atom } from 'recoil';
import type { Entry } from '../../types/IndexDb';

export const entriesState = atom<Entry[]>({
  key: 'entriesState',
  default: [],
});
