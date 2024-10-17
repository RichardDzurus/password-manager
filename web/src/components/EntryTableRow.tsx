import { useState } from 'react';
import { DecryptedEntry } from '../types/Decrypted';
import { TableRow, TableCell } from './ui/table';

type EntryTableRowProps = {
  entry: DecryptedEntry;
};

type PasswordCellProps = {
  password: string;
  passwordState: PasswordState;
};

enum PasswordState {
  Hidden,
  Visible,
}

const PasswordCell: React.FC<PasswordCellProps> = ({ password, passwordState }) => {
  if (passwordState === PasswordState.Hidden) {
    return <TableCell>******</TableCell>;
  }

  return <TableCell>{password}</TableCell>;
};

const EntryTableRow: React.FC<EntryTableRowProps> = ({ entry }) => {
  const [passwordState, setPasswordState] = useState<PasswordState>(PasswordState.Hidden);

  return (
    <TableRow key={entry.id}>
      <TableCell className="font-medium">{entry.title}</TableCell>
      <TableCell className="font-medium">{entry.description}</TableCell>
      <TableCell className="font-medium">{entry.type}</TableCell>
      {entry.type === 'login' && <TableCell>{entry.data.username}</TableCell>}
      {(entry.type === 'login' || entry.type === 'password') && (
        <>
          <PasswordCell password={entry.data.password} passwordState={passwordState} />
          <TableCell>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setPasswordState(PasswordState.Visible)}
            >
              Show
            </button>
          </TableCell>
          <TableCell>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => navigator.clipboard.writeText(entry.data.password)}
            >
              Copy
            </button>
          </TableCell>
          <TableCell>{entry.data.url}</TableCell>
        </>
      )}
      <TableCell className="font-medium">{entry.data.note}</TableCell>
    </TableRow>
  );
};

export default EntryTableRow;
