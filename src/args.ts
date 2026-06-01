/**
 * Shared CLI flag parser used by the management commands.
 *
 * Splits argv into positionals and a flag map. Flags are `--key value`,
 * `--key=value`, or a bare `--key` (boolean true). A value that itself starts
 * with `--` is treated as the next flag, so the preceding `--key` becomes a
 * boolean. This is intentionally simple — specialized commands (query, ui) keep
 * their own parsers for short flags / typed options.
 */

export type Flags = Record<string, string | boolean>;

export function parseFlags(args: string[]): { positionals: string[]; flags: Flags } {
  const flags: Flags = {};
  const positionals: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const next = args[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          flags[a.slice(2)] = next;
          i++;
        } else {
          flags[a.slice(2)] = true;
        }
      }
    } else {
      positionals.push(a);
    }
  }
  return { positionals, flags };
}
