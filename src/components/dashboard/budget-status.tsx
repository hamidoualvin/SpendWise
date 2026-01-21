'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type Budget, type Transaction, type CategoryName } from '@/lib/types';
import { categoryMap } from '@/lib/data';
import { CategoryIcon } from '@/components/icons/category-icon';

interface BudgetStatusProps {
  budgets: Budget[];
  transactions: Transaction[];
}

export function BudgetStatus({ budgets, transactions }: BudgetStatusProps) {
  const getCategorySpending = (category: CategoryName) => {
    return transactions
      .filter((t) => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Budget Status</CardTitle>
        <CardDescription>Your spending progress for this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = getCategorySpending(budget.category);
            const progress = Math.min((spent / budget.limit) * 100, 100);
            const isOverBudget = spent > budget.limit;

            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={budget.category} />
                    <span className="font-medium">{budget.category}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span
                      className={
                        isOverBudget ? 'font-bold text-destructive' : ''
                      }
                    >
                      ${spent.toFixed(2)}
                    </span>{' '}
                    / ${budget.limit.toFixed(2)}
                  </div>
                </div>
                <Progress
                  value={progress}
                  className={isOverBudget ? '[&>div]:bg-destructive' : ''}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
