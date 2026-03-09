'use client';
import * as React from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { BudgetStatus } from '@/components/dashboard/budget-status';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { Landmark, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { DashboardDataProvider, useDashboardData } from '@/contexts/dashboard-data';
import { startOfMonth } from 'date-fns';

function DashboardContent() {
  const { transactions, accounts, isLoading } = useDashboardData();

  const { totalBalance, totalIncome, totalExpenses } = React.useMemo(() => {
    if (!accounts || !transactions) {
      return { totalBalance: 0, totalIncome: 0, totalExpenses: 0 };
    }

    const initialBalance = accounts.reduce((sum, acc) => sum + acc.initialBalanceCents, 0);
    const currentMonthStart = startOfMonth(new Date());

    let totalIncome = 0;
    let totalExpenses = 0;
    let allTimeIncome = 0;
    let allTimeExpenses = 0;

    transactions.forEach(t => {
      const transactionDate = t.date.toDate();
      if (t.type === 'income') {
        allTimeIncome += t.amountCents;
        if (transactionDate >= currentMonthStart) totalIncome += t.amountCents;
      } else {
        allTimeExpenses += t.amountCents;
        if (transactionDate >= currentMonthStart) totalExpenses += t.amountCents;
      }
    });

    return { totalBalance: initialBalance + allTimeIncome - allTimeExpenses, totalIncome, totalExpenses };
  }, [accounts, transactions]);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Total Balance"
            value={totalBalance}
            icon={Landmark}
            iconColor="text-primary"
            isLoading={isLoading}
          />
          <SummaryCard
            title="Monthly Income"
            value={totalIncome}
            icon={ArrowUpCircle}
            iconColor="text-green-500"
            isLoading={isLoading}
          />
          <SummaryCard
            title="Monthly Expenses"
            value={totalExpenses}
            icon={ArrowDownCircle}
            iconColor="text-red-500"
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <AiInsights />
          </div>
          <div className="lg:col-span-2">
            <BudgetStatus />
          </div>
        </div>

        <RecentTransactions />
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <DashboardDataProvider>
      <DashboardContent />
    </DashboardDataProvider>
  );
}
