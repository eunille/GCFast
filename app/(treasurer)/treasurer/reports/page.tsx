"use client";

import { useCallback, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportFilters } from "@/features/reports/components/ReportFilters";
import { DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react";
import { useGenerateReport } from "@/features/reports/hooks/useGenerateReport";
import { useColleges } from "@/lib/hooks/useColleges";
import { formatCurrency } from "@/lib/utils/format";
import type { ReportFilters as ReportFiltersType } from "@/features/reports/types/report.types";
import { ReportStatsCard } from "@/features/reports/components/ReportsStatsCard";
import ReportTable from "@/features/reports/components/ReportTable/ReportTable";

export const dynamic = "force-dynamic";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function startOfYearISO() {
  return `${new Date().getFullYear()}-01-01`;
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export default function TreasurerReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    reportType: "payment_summary",
    startDate: startOfYearISO(),
    endDate: todayISO(),
  });
  const { data: colleges } = useColleges();
  const {
    data: reportData,
    isLoading: reportLoading,
    isFetching: reportFetching,
  } = useGenerateReport({
    ...filters,
    year: new Date(filters.startDate).getFullYear(),
  });

  const stats = reportData?.data;
  const isLoadingReport = reportLoading || reportFetching;

  const handleGenerateReport = useCallback((newFilters: ReportFiltersType) => {
    setFilters((current) => {
      if (
        current.reportType === newFilters.reportType &&
        current.collegeId === newFilters.collegeId &&
        current.startDate === newFilters.startDate &&
        current.endDate === newFilters.endDate
      ) {
        return current;
      }

      return newFilters;
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reports
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Generate and export detailed reports for analysis
        </p>
      </div>

      {/* Filters */}
      <ReportFilters
        colleges={colleges || []}
        initialFilters={filters}
        onGenerate={handleGenerateReport}
        isGenerating={isLoadingReport}
      />

      {/* Stats Cards */}
      {isLoadingReport ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ReportStatsCard
            label="Total Collected"
            value={formatCurrency(stats.totalCollected)}
            subLabel={`+${stats.totalCollectedChangePercent}% vs last period`}
            accent="success"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <ReportStatsCard
            label="Outstanding"
            value={formatCurrency(stats.outstanding)}
            subLabel={`${stats.outstandingMemberCount} members`}
            accent="danger"
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <ReportStatsCard
            label="Members Paid"
            value={stats.membersPaid}
            subLabel={`${stats.membersPaidPercent}% of total`}
            accent="success"
            icon={<Users className="h-5 w-5" />}
          />
          <ReportStatsCard
            label="Avg Collection"
            value={formatCurrency(stats.averageCollectionPerMember)}
            subLabel="per member"
            accent="default"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      <ReportTable/>
    </div>
  );
}
