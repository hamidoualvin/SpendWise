'use client';

import React, { createContext, useContext } from 'react';
import { useCollection, useUser, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Transaction, Category, Account, WithId } from '@/lib/types';
import { startOfMonth } from 'date-fns';

interface DashboardDataContextValue {
  transactions: WithId<Transaction>[] | null;
  /** Transactions du mois courant (filtrées en mémoire depuis le listener partagé) */
  transactionsThisMonth: WithId<Transaction>[] | null;
  categories: WithId<Category>[] | null;
  accounts: WithId<Account>[] | null;
  isLoading: boolean;
}

const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
  }, [firestore, isUserLoading, user?.uid]);

  const categoriesQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'categories'));
  }, [firestore, isUserLoading, user?.uid]);

  const accountsQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'accounts'));
  }, [firestore, isUserLoading, user?.uid]);

  const { data: transactions, isLoading: isLoadingTx } = useCollection<WithId<Transaction>>(transactionsQuery);
  const { data: categories, isLoading: isLoadingCat } = useCollection<WithId<Category>>(categoriesQuery);
  const { data: accounts, isLoading: isLoadingAcc } = useCollection<WithId<Account>>(accountsQuery);

  // Pre-compute current month transactions once to avoid repeated filtering in children
  const transactionsThisMonth = React.useMemo(() => {
    if (!transactions) return null;
    const monthStart = startOfMonth(new Date());
    return transactions.filter(t => t.date.toDate() >= monthStart);
  }, [transactions]);

  const isLoading = isUserLoading || isLoadingTx || isLoadingCat || isLoadingAcc;

  return (
    <DashboardDataContext.Provider value={{ transactions, transactionsThisMonth, categories, accounts, isLoading }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData(): DashboardDataContextValue {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error('useDashboardData must be used within DashboardDataProvider');
  return ctx;
}
