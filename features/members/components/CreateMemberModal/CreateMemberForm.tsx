// features/members/components/CreateMemberModal/CreateMemberForm.tsx
// Layer 4 — PRESENTATIONAL: Form fields for creating a new member

import type { CreateMemberInput } from "../../types/member.schemas";

interface Props {
  onSubmit: (data: CreateMemberInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function CreateMemberForm(_props: Props) {
  return null;
}

