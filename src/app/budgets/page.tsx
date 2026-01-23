'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { BudgetCard } from '@/components/budgets/budget-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import {
  AddBudgetDialog,
} from '@/components/budgets/add-budget-dialog';
import { useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Transaction, Budget, Category, WithId } from '@/lib/types';
import { getMonth, getYear } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';


export default function BudgetsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const currentMonth = `${getYear(new Date())}-${(getMonth(new Date()) + 1).toString().padStart(2, '0')}`;

  const budgetsQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return query(
      collection(firestore, 'budgets'),
      where('userId', '==', user.uid),
      where('month', '==', currentMonth)
    );
  }, [firestore, user?.uid, currentMonth]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return query(
      collection(firestore, 'transactions'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user?.uid]);
  
  const categoriesQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return query(collection(firestore, 'categories'), where('userId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: budgets, isLoading: isLoadingBudgets } = useCollection<Budget>(budgetsQuery);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<WithId<Category>>(categoriesQuery);

  const categoryMap = React.useMemo(() => {
    if (!categories) return new Map();
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);


  const getCategorySpending = (categoryId: string) => {
    if (!transactions) return 0;
    return transactions
      .filter((t) => {
        const transactionDate = t.date.toDate();
        return (
          t.type === 'expense' &&
          t.categoryId === categoryId &&
          getYear(transactionDate) === getYear(new Date()) &&
          getMonth(transactionDate) === getMonth(new Date())
        );
      })
      .reduce((sum, t) => sum + t.amountCents, 0);
  };
  
  const totalBudget = budgets?.reduce((sum, b) => sum + b.limitCents, 0) ?? 0;
  
  const totalSpent = transactions?.filter(t => {
    const transactionDate = t.date.toDate();
    return t.type === 'expense' && getYear(transactionDate) === getYear(new Date()) && getMonth(transactionDate) === getMonth(new Date());
  }).reduce((sum, t) => sum + t.amountCents, 0) ?? 0;

  const totalRemaining = totalBudget - totalSpent;
  
  const isLoading = isLoadingBudgets || isLoadingTransactions || isLoadingCategories;

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Budgets
            </h1>
            <p className="text-muted-foreground">
              Gérez vos objectifs de dépenses mensuelles.
            </p>
          </div>
          <AddBudgetDialog
            existingCategories={categories || []}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sommaire général du budget</CardTitle>
            <CardDescription>
              Un aperçu de haut niveau de votre budget total et de vos dépenses.
            </CardDescription>
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
                      <p className="text-sm font-medium text-muted-foreground">
                        Budget Total
                      </p>
                      <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Dépensé
                      </p>
                      <p className="text-2xl font-bold text-destructive">
                        {formatCurrency(totalSpent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Restant
                      </p>
                      <p
                        className={cn(
                          'text-2xl font-bold',
                          totalRemaining < 0 ? 'text-destructive' : 'text-green-600'
                        )}
                      >
                        {formatCurrency(totalRemaining)}
                      </p>
                    </div>
                </>
             )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}

          {!isLoading && budgets?.map((budget) => {
            const spent = getCategorySpending(budget.categoryId);
            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                spent={spent}
                categoryMap={categoryMap}
                categories={categories || []}
              />
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
