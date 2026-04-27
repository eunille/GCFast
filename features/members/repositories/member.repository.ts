// features/members/repositories/member.repository.ts
// Layer 2 — DATA: Only layer that calls Supabase. No JSX. No React hooks.

import { supabase } from "@/lib/supabase/client";
import { mapMemberFromDb } from "./member.mapper";
import type { Member, MemberFilter } from "../types/member.types";
import type { CreateMemberInput, UpdateMemberInput } from "../types/member.schemas";

export const memberRepository = {
  async getAll(filter?: MemberFilter): Promise<Member[]> {
    let query = supabase.from("members").select("*, colleges(name)");

    if (filter?.collegeId) {
      query = query.eq("college_id", filter.collegeId);
    }
    if (filter?.status) {
      query = query.eq("status", filter.status);
    }
    if (filter?.search) {
      query = query.ilike("full_name", `%${filter.search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(mapMemberFromDb);
  },

  async getById(id: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from("members")
      .select("*, colleges(name)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return mapMemberFromDb(data);
  },

  async create(input: CreateMemberInput): Promise<Member> {
    const { data, error } = await supabase
      .from("members")
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        college_id: input.collegeId,
        role: input.role,
      })
      .select("*, colleges(name)")
      .single();

    if (error) throw new Error(error.message);
    return mapMemberFromDb(data);
  },

  async update(id: string, input: UpdateMemberInput): Promise<Member> {
    const { data, error } = await supabase
      .from("members")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        college_id: input.collegeId,
        role: input.role,
        status: input.status,
      })
      .eq("id", id)
      .select("*, colleges(name)")
      .single();

    if (error) throw new Error(error.message);
    return mapMemberFromDb(data);
  },
};
