// features/members/repositories/member.repository.ts
// Layer 2 — DATA: Calls /api/members via authFetch. No JSX. No React hooks.

import { authFetch } from "@/lib/utils/auth-fetch";
import type { Member, CreateMemberInput, UpdateMemberInput, MemberListQuery } from "@/lib/models";
import type { ApiSuccess, PaginationMeta } from "@/lib/models";

function buildQuery(filter: MemberListQuery): string {
  const params = new URLSearchParams();
  if (filter.page)       params.set("page",       String(filter.page));
  if (filter.pageSize)   params.set("pageSize",   String(filter.pageSize));
  if (filter.search)     params.set("search",     filter.search);
  if (filter.collegeId)  params.set("collegeId",  filter.collegeId);
  if (filter.memberType) params.set("memberType", filter.memberType);
  if (filter.sortBy)     params.set("sortBy",     filter.sortBy);
  if (filter.sortOrder)  params.set("sortOrder",  filter.sortOrder);
  if (filter.isActive !== undefined)
    params.set("isActive", String(filter.isActive));
  return params.toString();
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "API error");
  return json.data as T;
}

export const memberRepository = {
  async getAll(
    filter: MemberListQuery = {}
  ): Promise<{ data: Member[]; meta: PaginationMeta }> {
    const qs = buildQuery(filter);
    const res = await authFetch(`/api/members${qs ? `?${qs}` : ""}`);
    const json = await res.json() as ApiSuccess<Member[]>;
    if (!json.success) throw new Error((json as { error?: { message?: string } }).error?.message ?? "API error");
    return { data: json.data, meta: json.meta! };
  },

  async getById(id: string): Promise<Member | null> {
    const res = await authFetch(`/api/members/${id}`);
    if (res.status === 404) return null;
    return parseJson<Member>(res);
  },

  async create(input: CreateMemberInput): Promise<Member> {
    const res = await authFetch("/api/members", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return parseJson<Member>(res);
  },

  async update(id: string, input: UpdateMemberInput): Promise<Member> {
    const res = await authFetch(`/api/members/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return parseJson<Member>(res);
  },

  async deactivate(id: string): Promise<void> {
    const res = await authFetch(`/api/members/${id}/deactivate`, {
      method: "PATCH",
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error?.message ?? "Failed to deactivate member");
    }
  },
};

