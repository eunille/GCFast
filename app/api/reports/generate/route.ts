import { apiHandler } from "@/lib/utils/api-handler";
import { withAuth } from "@/lib/middleware/withAuth";
import { withRole } from "@/lib/middleware/withRole";
import { validate } from "@/lib/utils/validate";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { ErrorCodes } from "@/lib/types/error-codes";
import { createSupabaseServer } from "@/lib/supabase/server";
import { generateReportSchema } from "@/features/reports/types/report.schemas";
import { buildReportData } from "@/lib/services/report-data.service";
import { buildExcelBuffer } from "@/lib/services/report-excel.service";
import { buildPdfBuffer } from "@/lib/services/report-pdf.service";

export const POST = apiHandler(async (req: Request) => {
  // 1. Authenticate + authorize (treasurer only)
  const authResult = await withAuth(req);
  if (authResult instanceof Response) return authResult;

  const roleResult = await withRole(authResult, "treasurer", req);
  if (!roleResult.success) return roleResult.response;

  // 2. Validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid JSON body", 400);
  }

  const parsed = validate(generateReportSchema, body);
  if (!parsed.success) return parsed.response;

  const { startDate, endDate, collegeId, format, reportType } = parsed.data;

  // 3. Build report data from DB — service handles all querying
  const supabase = await createSupabaseServer(req);
  const reportData = await buildReportData(
    { reportType, startDate, endDate, collegeId, format },
    supabase
  );

  // 4. Return in requested format
  const safeName   = collegeId ? `college-${collegeId.slice(0, 8)}` : "all-colleges";
  const dateRange  = `${startDate}-to-${endDate}`;

  if (format === "json") {
    return successResponse(reportData);
  }

  if (format === "excel") {
    const buffer = await buildExcelBuffer(reportData);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="gfast-report-${dateRange}-${safeName}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // pdf
  const buffer = await buildPdfBuffer(reportData);
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="gfast-report-${dateRange}-${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
});
