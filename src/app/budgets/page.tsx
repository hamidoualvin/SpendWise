'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { BudgetCard } from '@/components/budgets/budget-card';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { AddBudgetDialog } from '@/components/budgets/add-budget-dialog';
import { useCollection, useUser, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Transaction, Budget, Category, WithId } from '@/lib/types';
import { getMonth, getYear, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';

export default function BudgetsPage() {
  const { user, isUserLoading: isUserLoadingAuth } = useUser();
  const firestore = useFirestore();
  const currentMonth = `${getYear(new Date())}-${(getMonth(new Date()) + 1).toString().padStart(2, '0')}`;

  const { monthStart, monthEnd } = React.useMemo(() => ({
    monthStart: startOfMonth(new Date()),
    monthEnd: endOfMonth(new Date()),
  }), []);

  const budgetsQuery = useMemoFirebase(() => {
    if (isUserLoadingAuth || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'budgets'), where('month', '==', currentMonth));
  }, [firestore, isUserLoadingAuth, user?.uid, currentMonth]);

  const transactionsQuery = useMemoFirebase(() => {
    if (isUserLoadingAuth || !user?.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      where('date', '>=', Timestamp.fromDate(monthStart)),
      where('date', '<=', Timestamp.fromDate(monthEnd))
    );
  }, [firestore, isUserLoadingAuth, user?.uid, monthStart, monthEnd]);

  const categoriesQuery = useMemoFirebase(() => {
    if (isUserLoadingAuth || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'categories'));
  }, [firestore, isUserLoadingAuth, user?.uid]);

  const { data: budgets, isLoading: isLoadingBudgets } = useCollection<WithId<Budget>>(budgetsQuery);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<WithId<Transaction>>(transactionsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<WithId<Category>>(categoriesQuery);

  const categoryMap = React.useMemo(() => {
    if (!categories) return new Map();
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const getCategorySpending = (categoryId: string) => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === categoryId)
      .reduce((sum, t) => sum + t.amountCents, 0);
  };

  const totalBudget = budgets?.reduce((sum, b) => sum + b.limitCents, 0) ?? 0;
  const totalSpent = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amountCents, 0) ?? 0;
  const totalRemaining = totalBudget - totalSpent;

  const isLoading = isUserLoadingAuth || isLoadingBudgets || isLoadingTransactions || isLoadingCategories;

  // Bar chart: Budget limit vs. Spent per category
  const budgetChartData = React.useMemo(() => {
    if (!budgets || !categories) return [];
    return budgets.map(budget => {
      const spent = getCategorySpending(budget.categoryId);
      return {
        name: categoryMap.get(budget.categoryId)?.name ?? '…',
        Budget: Math.round(budget.limitCents / 100),
        Dépensé: Math.round(spent / 100),
        overBudget: spent > budget.limitCents,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgets, transactions, categories]);

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Budgets</h1>
            <p className="text-muted-foreground">Gérez vos objectifs de dépenses mensuelles.</p>
          </div>
          <AddBudgetDialog existingCategories={categories || []} />
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Sommaire général du budget</CardTitle>
            <CardDescription>Aperçu de votre budget total et de vos dépenses.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
            {isLoading ? (
              <>
                <div><Skeleton className="h-6 w-1/2 mx-auto mb-1" /><Skeleton className="h-4 w-1/3 mx-auto" /></div>
                <div><Skeleton className="h-6 w-1/2 mx-auto mb-1" /><Skeleton className="h-4 w-1/3 mx-auto" /></div>
                <div><Skeleton className="h-6 w-1/2 mx-auto mb-1" /><Skeleton className="h-4 w-1/3 mx-auto" /></div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Dépensé</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalSpent)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Restant</p>
                  <p className={cn('text-2xl font-bold', totalRemaining < 0 ? 'text-destructive' : 'text-green-600')}>
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Budget vs Spent chart */}
        {!isLoading && budgetChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Dépensé par catégorie</CardTitle>
              <CardDescription>Visualisation du respect de chaque budget ce mois-ci.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={budgetChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} width={60} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, '']} />
                  <Legend />
                  <Bar dataKey="Budget" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Dépensé" radius={[4, 4, 0, 0]}>
                    {budgetChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.overBudget ? '#EF4444' : '#8B5CF6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Budget cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
          {!isLoading && budgets?.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={getCategorySpending(budget.categoryId)}
              categoryMap={categoryMap}
              categories={categories || []}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
