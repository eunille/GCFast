// features/dues-configurations/repositories/dues-config.mapper.ts

import type { DuesConfig, DuesConfigRow } from "../types/dues-config.types";

export function mapDuesConfigRow(row: DuesConfigRow): DuesConfig {
  return {
    id: row.id,
    paymentType: row.payment_type,
    memberType: row.member_type,
    amount: parseFloat(row.amount),
    effectiveFrom: row.effective_from,
    effectiveUntil: row.effective_until,
    createdAt: row.created_at,
  };
}
