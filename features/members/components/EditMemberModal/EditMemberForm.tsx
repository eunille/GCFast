// features/members/components/EditMemberModal/EditMemberForm.tsx
// Layer 4 — PRESENTATIONAL: Form for editing an existing member's details and status

import type { Member } from "../../types/member.types";
import type { UpdateMemberInput } from "../../types/member.schemas";

interface Props {
  member: Member;
  onSubmit: (data: UpdateMemberInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function EditMemberForm(_props: Props) {
  return null;
}

