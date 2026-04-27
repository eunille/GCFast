// lib/repositories/college.repository.ts
// Layer 2 — DATA: Fetches college reference data

import { supabase } from "@/lib/supabase/client";
import type { College } from "@/lib/types/shared.types";

export const collegeRepository = {
  async getAll(): Promise<College[]> {
    const { data, error } = await supabase
      .from("colleges")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      code: "",
    }));
  },
};
