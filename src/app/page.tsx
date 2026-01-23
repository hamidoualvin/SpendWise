'use client';
import * as React from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { BudgetStatus } from '@/components/dashboard/budget-status';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { Landmark, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

// imports for data fetching
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Account, Transaction } from '@/lib/types';
import { startOfMonth } from 'date-fns';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const accountsQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return query(collection(firestore, 'accounts'), where('userId', '==', user.uid));
  }, [user?.uid, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return query(collection(firestore, 'transactions'), where('userId', '==', user.uid));
  }, [user?.uid, firestore]);
  
  const { data: accounts, isLoading: isLoadingAccounts } = useCollection<Account>(accountsQuery);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

  const { totalBalance, totalIncome, totalExpenses } = React.useMemo(() => {
    if (!accounts || !transactions) {
      return { totalBalance: 0, totalIncome: 0, totalExpenses: 0 };
    }
    
    const initialBalance = accounts.reduce((sum, acc) => sum + acc.initialBalanceCents, 0);

    const now = new Date();
    const currentMonthStart = startOfMonth(now);

    let totalIncome = 0;
    let totalExpenses = 0;
    let allTimeIncome = 0;
    let allTimeExpenses = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        allTimeIncome += t.amountCents;
        if (t.date.toDate() >= currentMonthStart) {
          totalIncome += t.amountCents;
        }
      } else {
        allTimeExpenses += t.amountCents;
        if (t.date.toDate() >= currentMonthStart) {
          totalExpenses += t.amountCents;
        }
      }
    });

    const totalBalance = initialBalance + allTimeIncome - allTimeExpenses;

    return { totalBalance, totalIncome, totalExpenses };
  }, [accounts, transactions]);

  const isLoadingSummary = isLoadingAccounts || isLoadingTransactions;

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Total Balance"
            value={totalBalance}
            icon={Landmark}
            iconColor="text-primary"
            isLoading={isLoadingSummary}
          />
          <SummaryCard
            title="Monthly Income"
            value={totalIncome}
            icon={ArrowUpCircle}
            iconColor="text-green-500"
            isLoading={isLoadingSummary}
          />
          <SummaryCard
            title="Monthly Expenses"
            value={totalExpenses}
            icon={ArrowDownCircle}
            iconColor="text-red-500"
            isLoading={isLoadingSummary}
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
