# API Business — Canonical payload for teacher payments

This document describes the canonical payload the `PaymentService` builds and inserts into the `teacher_payment` table.

Location
- Service: `api-business/src/services/PaymentService.js`

What the service builds
- `EmpID` (number): employee/teacher identifier. Filled from the `teacherId` param.
- `PaymentPeriod` (date string YYYY-MM-01): canonical period start for the payment.
- `PeriodStartDate` (date string): period start (defaults to `PaymentPeriod`).
- `PeriodEndDate` (date string): period end (defaults to `PaymentPeriod`).
- `BaseSalary` (numeric): base pay for the period (defaults to `0`).
- `Bonuses` (numeric): bonuses for the period (defaults to `0`).
- `Overtime` (numeric): overtime amount (defaults to `0`).
- `Deductions` (numeric): deductions (defaults to `0`).
- `TotalAmount` (numeric): total payable amount. If not provided, computed as `BaseSalary + Bonuses + Overtime - Deductions`.
- `PaymentDate` (date string YYYY-MM-DD): date of payment (defaults to today).
- `PaymentMethod` (string): e.g. `Transfer` (defaults to `Transfer`).
- `Status` (string): payment status (defaults to `Pending` unless provided).
- `TransactionReference` (string|null): optional transaction/reference id.
- `Notes` (string|null): optional free-text notes.
- `ProcessedBy` (number|null): user id who processed the payment (filled from `processedBy` param).
- `CreatedBy` (number|null): same as `ProcessedBy` on create.

Why this canonical payload
- The `teacher_payment` table in this project uses a stable column layout (see DB schema). The service centralizes defaults and field normalization so callers only need to provide partial data (e.g. `BaseSalary`, `PaidAmount` is not required by table schema).

Example payload (what the service will produce)

```json
{
  "EmpID": 1,
  "PaymentPeriod": "2026-01-01",
  "PeriodStartDate": "2026-01-01",
  "PeriodEndDate": "2026-01-01",
  "BaseSalary": 1000,
  "Bonuses": 50,
  "Overtime": 0,
  "Deductions": 10,
  "TotalAmount": 1040,
  "PaymentDate": "2026-01-30",
  "PaymentMethod": "Transfer",
  "Status": "Pending",
  "TransactionReference": null,
  "Notes": null,
  "ProcessedBy": 1,
  "CreatedBy": 1
}
```

Quick test (local)

- Start `api-business` (it loads env from `.env`).
- Use the existing `temp_payment.json` as request body and POST to `/api/finance/payment` with header `x-dev-user: 1`.

PowerShell example:

```powershell
$body = Get-Content -Raw -Path 'temp_payment.json'
Invoke-RestMethod -Uri 'http://localhost:3002/api/finance/payment' -Method POST -ContentType 'application/json' -Body $body -Headers @{ 'x-dev-user' = '1' }
```

Notes / Next steps
- If you want the DB to track `PaidAmount` or other additional fields, update the schema and the `buildTeacherPayload` function in `PaymentService.js` accordingly.
- Keep this README in sync with DB DDL for `teacher_payment`.
