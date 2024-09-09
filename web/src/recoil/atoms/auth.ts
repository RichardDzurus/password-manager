import { atom } from 'recoil';
import type { User } from '../../types/User';

export const authState = atom<User | null>({
  key: 'authState',
  default: null,
});
