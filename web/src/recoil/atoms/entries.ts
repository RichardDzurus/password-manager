import { atom } from 'recoil';
import type { Entry } from '../../types/IndexDb';
import { selectAll } from '../../dbs/indexDb';

export const entriesState = atom<Entry[]>({
  key: 'entriesState',
  default: (await selectAll('entries')) ?? [],
});
