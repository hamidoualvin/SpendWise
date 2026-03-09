'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CategoryIcon } from '@/components/icons/category-icon';
import { useCollection, useUser, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Budget, WithId } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getMonth, getYear } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { useDashboardData } from '@/contexts/dashboard-data';

export function BudgetStatus() {
  const { user, isUserLoading: isUserLoadingAuth } = useUser();
  const firestore = useFirestore();
  const { transactionsThisMonth, categories, isLoading: isDashboardLoading } = useDashboardData();

  const currentMonth = `${getYear(new Date())}-${(getMonth(new Date()) + 1).toString().padStart(2, '0')}`;

  const budgetsQuery = useMemoFirebase(() => {
    if (isUserLoadingAuth || !user?.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'budgets'),
      where('month', '==', currentMonth)
    );
  }, [firestore, isUserLoadingAuth, user?.uid, currentMonth]);

  const { data: budgets, isLoading: isLoadingBudgets } = useCollection<WithId<Budget>>(budgetsQuery);

  const categoryMap = React.useMemo(() => {
    if (!categories) return new Map();
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const getCategorySpending = (categoryId: string) => {
    if (!transactionsThisMonth) return 0;
    return transactionsThisMonth
      .filter((t) => t.type === 'expense' && t.categoryId === categoryId)
      .reduce((sum, t) => sum + t.amountCents, 0);
  };

  const isLoading = isUserLoadingAuth || isLoadingBudgets || isDashboardLoading;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Budget Status</CardTitle>
        <CardDescription>Your spending progress for this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && Array.from({length: 4}).map((_, i) => (
            <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-2 w-full" />
            </div>
          ))}
          {!isLoading && budgets?.map((budget) => {
            const spent = getCategorySpending(budget.categoryId);
            const progress = Math.min((spent / budget.limitCents) * 100, 100);
            const isOverBudget = spent > budget.limitCents;
            const category = categoryMap.get(budget.categoryId);

            if (!category) return null;

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon categoryId={budget.categoryId} categories={categories || []} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className={isOverBudget ? 'font-bold text-destructive' : ''}>
                      {formatCurrency(spent, budget.currency)}
                    </span>{' '}
                    / {formatCurrency(budget.limitCents, budget.currency)}
                  </div>
                </div>
                <Progress
                  value={progress}
                  className={isOverBudget ? '[&>div]:bg-destructive' : ''}
                />
              </div>
            );
          })}
          {!isLoading && budgets?.length === 0 && (
            <div className="text-center text-muted-foreground">
                No budgets set for this month.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
