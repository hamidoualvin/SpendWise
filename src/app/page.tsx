import { AppShell } from '@/components/layout/app-shell';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { BudgetStatus } from '@/components/dashboard/budget-status';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { Landmark, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function DashboardPage() {
  // Data will be fetched via hooks inside the components
  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Total Balance"
            // value={totalBalance}
            icon={Landmark}
            iconColor="text-primary"
          />
          <SummaryCard
            title="Monthly Income"
            // value={totalIncome}
            icon={ArrowUpCircle}
            iconColor="text-green-500"
          />
          <SummaryCard
            title="Monthly Expenses"
            // value={totalExpenses}
            icon={ArrowDownCircle}
            iconColor="text-red-500"
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

    