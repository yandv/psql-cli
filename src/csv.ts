/**
 * Minimal RFC4180 CSV parser for the output of `psql --csv`.
 *
 * - Fields are comma-separated and may be optionally double-quoted.
 * - Inside a quoted field, an embedded double-quote is escaped by doubling
 *   it (`""`).
 * - Quoted fields may contain commas and newlines.
 * - Records are separated by CRLF or LF.
 * - The first record is the column header; remaining records are rows.
 *
 * Note: psql renders SQL NULL as an empty *unquoted* field, and an empty
 * string as `""`. After parsing, both become the JS empty string `''`; the
 * distinction is intentionally not preserved (documented behaviour).
 */
export function parseCsv(text: string): { columns: string[]; rows: string[][] } {
  if (text === '') return { columns: [], rows: [] };

  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;
  let started = false; // whether the current record has any content yet

  const pushField = (): void => {
    record.push(field);
    field = '';
  };
  const pushRecord = (): void => {
    pushField();
    records.push(record);
    record = [];
    started = false;
  };

  const len = text.length;
  for (let i = 0; i < len; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      started = true;
    } else if (ch === ',') {
      started = true;
      pushField();
    } else if (ch === '\r') {
      // CRLF or lone CR -> record separator. Skip a following \n.
      if (text[i + 1] === '\n') i++;
      pushRecord();
    } else if (ch === '\n') {
      pushRecord();
    } else {
      started = true;
      field += ch;
    }
  }

  // Flush the final record unless the input ended exactly on a record
  // separator (so a trailing newline does not create a phantom empty row).
  if (started || field !== '' || record.length > 0) {
    pushRecord();
  }

  if (records.length === 0) return { columns: [], rows: [] };
  const [columns, ...rows] = records;
  return { columns, rows };
}
