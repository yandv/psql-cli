/**
 * Statement-level guard for read-only databases.
 *
 * This is layer 1 of the read-only defense. Layer 2 (the authoritative one) is
 * `default_transaction_read_only = on`, forced on the Postgres session itself in
 * db.ts — so even if a clever statement slips past this regex, the server still
 * refuses to write. We keep this layer because it gives a fast, clear error
 * message and blocks obviously-destructive input before it ever reaches the DB.
 */

const ALLOWED_START = /^\s*(select|with|explain|show|table|values)\b/i;

const WRITE_KEYWORDS =
  /\b(drop|delete|update|insert|alter|truncate|create|grant|revoke|copy|vacuum|reindex|call|do|merge|refresh|listen|notify|lock|comment|cluster|reset|set|prepare|deallocate|begin|commit|rollback|savepoint|import|security|fdw)\b/i;

export interface GuardResult {
  ok: boolean;
  reason?: string;
}

export function checkReadOnly(sql: string): GuardResult {
  const trimmed = sql.trim();
  if (!trimmed) return { ok: false, reason: 'Empty SQL.' };

  if (!ALLOWED_START.test(trimmed)) {
    return {
      ok: false,
      reason:
        'Read-only database: only SELECT / WITH / EXPLAIN / SHOW / TABLE / VALUES are allowed.',
    };
  }

  // EXPLAIN ANALYZE actually executes the statement, which could be a write.
  if (/^\s*explain\b/i.test(trimmed) && /\banalyze\b/i.test(trimmed)) {
    return {
      ok: false,
      reason: 'Read-only database: "EXPLAIN ANALYZE" executes the query and is blocked.',
    };
  }

  if (WRITE_KEYWORDS.test(trimmed)) {
    const m = trimmed.match(WRITE_KEYWORDS);
    return {
      ok: false,
      reason: `Read-only database: statement contains a blocked keyword "${m?.[0]}".`,
    };
  }

  return { ok: true };
}
