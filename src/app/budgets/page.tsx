'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import {
  budgets as initialBudgets,
  transactions,
  categories as initialCategories,
} from '@/lib/data';
import type { CategoryName, Transaction, Budget, Category } from '@/lib/types';
import { BudgetCard } from '@/components/budgets/budget-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  AddBudgetDialog,
  iconMap,
  IconName,
} from '@/components/budgets/add-budget-dialog';
import { useToast } from '@/hooks/use-toast';

export default function BudgetsPage() {
  const [budgets, setBudgets] = React.useState<Budget[]>(initialBudgets);
  const [categories, setCategories] =
    React.useState<Category[]>(initialCategories);

  const categoryMap = React.useMemo(() => {
    return new Map(categories.map((c) => [c.name, c]));
  }, [categories]);

  const { toast } = useToast();

  const handleAddBudget = (data: {
    name: string;
    limit: number;
    icon: string;
  }) => {
    const IconComponent = iconMap[data.icon as IconName];
    if (!IconComponent) {
      console.error('Invalid icon selected');
      toast({
        title: 'Invalid Icon',
        description: 'The selected icon is not valid.',
        variant: 'destructive',
      });
      return;
    }

    const newCategory: Category = { name: data.name, icon: IconComponent };
    const newBudget: Budget = { category: data.name, limit: data.limit };

    setCategories((prev) => [...prev, newCategory]);
    setBudgets((prev) => [...prev, newBudget]);
  };

  const getCategorySpending = (
    category: CategoryName,
    allTransactions: Transaction[]
  ) => {
    return allTransactions
      .filter((t) => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRemaining = totalBudget - totalSpent;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
            onAddBudget={handleAddBudget}
            existingCategories={categories.map((c) => c.name)}
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const spent = getCategorySpending(budget.category, transactions);
            return (
              <BudgetCard
                key={budget.category}
                budget={budget}
                spent={spent}
                categoryMap={categoryMap}
              />
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
