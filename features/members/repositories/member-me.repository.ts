// features/members/repositories/member-me.repository.ts
// Layer 2 — DATA: Calls /api/members/me for member self-service profile access.

import { authFetch } from "@/lib/utils/auth-fetch";
import type { Member } from "@/lib/models";
import type { SelfUpdateMemberInput } from "../types/member.schemas";

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "API error");
  return json.data as T;
}

export const memberMeRepository = {
  async get(): Promise<Member> {
    const res = await authFetch("/api/members/me");
    return parseJson<Member>(res);
  },

  async update(input: SelfUpdateMemberInput): Promise<Member> {
    const res = await authFetch("/api/members/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return parseJson<Member>(res);
  },
};
