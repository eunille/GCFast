# GFAST-MPTS API Reference

All API routes follow a strict, consistent response envelope.

**Standard Success Envelope:**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": { 
    "count": 42,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
\`\`\`

**Standard Error Envelope:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than 0",
    "details": [ ... ]
  }
}
\`\`\`

---

## 1. Authentication & Authorization

### `GET /api/auth/me`
* **Description**: Returns the authenticated user's profile and role.
* **Auth**: Required.
* **Response**: Returns the `AuthUser` model.

### `POST /api/auth/invite`
* **Description**: Invites a faculty member to create their login.
* **Auth**: Treasurer only.
* **Body**: `{ "email": "string", "fullName": "string", "memberId": "uuid" }`
* **Response**: `201 Created` on success.

### `POST /api/auth/signout`
* **Description**: Signs out the current user.
* **Auth**: Required.
* **Response**: `200 OK`

---

## 2. Member Management

### `GET /api/members`
* **Description**: Fetches paginated members.
* **Auth**: Required (Treasurer sees all, member endpoint separate).
* **Query Params**: 
  * `collegeId` (UUID)
  * `memberType` (FULL_TIME | ASSOCIATE)
  * `isActive` (boolean)
  * `search` (string)
  * `sortBy` (full_name | joined_at | college_name)
  * `sortOrder` (asc | desc)
  * `page` (number)
  * `pageSize` (number)
* **Response**: Array of `Member` objects.

### `GET /api/members/[id]`
* **Description**: Gets a specific member. Member role can only fetch their own record.
* **Auth**: Required.
* **Response**: Single `Member` object.

### `POST /api/members`
* **Description**: Creates a new member.
* **Auth**: Treasurer only.
* **Body**: Uses `CreateMemberInput` model.
* **Response**: `201 Created` with new `Member` object.

### `PATCH /api/members/[id]`
* **Description**: Updates an existing member.
* **Auth**: Treasurer only.
* **Body**: Uses `UpdateMemberInput` model (Partial).
* **Response**: `200 OK` with updated `Member` object.

### `PATCH /api/members/[id]/deactivate`
* **Description**: Soft deletes a member (sets `is_active = FALSE`).
* **Auth**: Treasurer only.
* **Response**: `{ message: "Member deactivated" }`

---

## 3. Payment Records

### `GET /api/payments/summaries`
* **Description**: Retrieves aggregated member payment summaries.
* **Auth**: Treasurer only.
* **Query Params**: `collegeId`, `memberType`, `status`, `hasMembershipFee`, `month`, `year`, `search`, `sortBy`, `sortOrder`, `page`, `pageSize`.
* **Response**: Array of `MemberPaymentSummary` objects.

### `GET /api/payments/member/[memberId]`
* **Description**: Retrieves full payment history for a specific member.
* **Auth**: Required (Members can only fetch their own).
* **Query Params**: `paymentType`, `year`, `sortBy`, `sortOrder`, `page`, `pageSize`.

### `POST /api/payments`
* **Description**: Records a new payment and enforces duplicate checks.
* **Auth**: Treasurer only.
* **Body**: Uses `RecordPaymentInput` model.
* **Response**: `201 Created` with payment record.

---

## 4. Reference Data

### `GET /api/colleges`
* **Description**: Returns all active colleges ordered by name.
* **Auth**: Required.

### `GET /api/academic-periods`
* **Description**: Returns all active periods ordered by year and month.
* **Auth**: Required.

---

## 5. Dashboards & Reports

### `GET /api/dashboard/treasurer`
* **Description**: Retrieves high-level aggregated statistics.
* **Auth**: Treasurer only.
* **Response**: Uses `TreasurerDashboardStats` model.

### `GET /api/dashboard/member`
* **Description**: Retrieves the authenticated member's personal payment standing.
* **Auth**: Required.
* **Response**: Uses `MemberDashboardStats` model.

### `POST /api/reports/generate`
* **Description**: Generates and downloads reports.
* **Auth**: Treasurer only.
* **Body**: Uses `GenerateReportInput` model.
* **Response**: JSON payload or streamed `.xlsx`/`.pdf` buffer based on format.

---

## 6. Dues Configuration (Pricing Management)

### `GET /api/dues-configurations`
* **Description**: Lists dues configuration history. Defaults to active rates only.
* **Auth**: Required (any authenticated user).
* **Query Params**:
  * `paymentType` (`MEMBERSHIP_FEE` | `MONTHLY_DUES`)
  * `memberType` (`FULL_TIME` | `ASSOCIATE`)
  * `activeOnly` (boolean, default `true`)
* **Response**: Array of `DuesConfig` objects ordered by payment_type → member_type → effective_from DESC.

### `GET /api/dues-configurations/current`
* **Description**: Returns the 3 currently active rates as a flat key→value map. Optimised for the payment recording form.
* **Auth**: Required.
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "MEMBERSHIP_FEE_FULL_TIME": { "id": "...", "amount": 200, "effectiveFrom": "2025-01-01" },
      "MONTHLY_DUES_FULL_TIME":   { "id": "...", "amount": 50,  "effectiveFrom": "2025-01-01" },
      "MONTHLY_DUES_ASSOCIATE":   { "id": "...", "amount": 30,  "effectiveFrom": "2025-01-01" }
    }
  }
  ```

### `POST /api/dues-configurations`
* **Description**: Sets a new rate for a payment type / member type combination. Automatically closes the previous active rate.
* **Auth**: Treasurer only.
* **Body**:
  ```json
  {
    "paymentType": "MONTHLY_DUES",
    "memberType": "FULL_TIME",
    "amount": 75,
    "effectiveFrom": "2026-01-01"
  }
  ```
* **Response**: `201 Created` with the new `DuesConfig` object.
* **Rules**:
  * `MEMBERSHIP_FEE` + `ASSOCIATE` combination is rejected (`400`).
  * Duplicate `(paymentType, memberType, effectiveFrom)` returns `409 CONFLICT`.
  * Previous open-ended rate is closed automatically (`effective_until = effectiveFrom - 1 day`).
  * The `member_payment_summary` view picks up the new rate immediately.