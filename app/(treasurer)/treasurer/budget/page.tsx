// app/(treasurer)/treasurer/budget/page.tsx
// Layer 4 — PRESENTATIONAL: Treasurer budget management page (placeholder)

"use client";

import { useState } from "react";
import { DollarSign, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

// Placeholder data - will be replaced with actual data from API
const placeholderData = {
  totalCollected: 425000, // From existing payment records (future: API call)
  totalExpenses: 280000,  // Sum of expenses below
  remainingBalance: 145000, // Calculated: totalCollected - totalExpenses
};

// Placeholder expense entries - future: expense_records table
const placeholderExpenses = [
  {
    id: 1,
    description: "Faculty Day Celebration",
    category: "Events & Activities",
    amount: 15000,
    date: "2026-06-24",
  },
  {
    id: 2,
    description: "Office Supplies Purchase",
    category: "Office Operations",
    amount: 8500,
    date: "2026-06-20",
  },
  {
    id: 3,
    description: "Training Workshop Materials",
    category: "Professional Development",
    amount: 12000,
    date: "2026-06-18",
  },
  {
    id: 4,
    description: "Member Benefits Disbursement",
    category: "Member Benefits",
    amount: 25000,
    date: "2026-06-15",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

export default function TreasurerBudgetPage() {
  const handleRecordExpense = () => {
    toast.info("Coming Soon", {
      description: "Expense recording feature will be available soon.",
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Budget Management
          </h1>
          <p className="text-sm mt-1 text-muted-foreground">
            Track GCFAS funds: collected, expenses, and remaining balance
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={handleRecordExpense}>
          <Plus className="h-4 w-4" />
          Record Expense
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Total Collected</p>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(placeholderData.totalCollected)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">From payment records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
              <DollarSign className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-600">
              {formatCurrency(placeholderData.totalExpenses)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Logged expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Remaining Balance</p>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(placeholderData.remainingBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Available funds</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense entries table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Expense Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item/Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right font-semibold text-rose-600">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {expense.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info note */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4 text-xs text-amber-900">
          <p className="font-medium mb-1">Placeholder Data</p>
          <p>
            This page uses sample numbers for demonstration. In the future phase, 
            data will come from: payment_records (total collected) and a new expense_records 
            table (expenses). The remaining balance is calculated automatically.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}