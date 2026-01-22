'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type Budget, type Category } from '@/lib/types';
import { CategoryIcon } from '@/components/icons/category-icon';
import { cn } from '@/lib/utils';

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  categoryMap: Map<string, Category>;
}

export function BudgetCard({ budget, spent, categoryMap }: BudgetCardProps) {
  const progress = Math.min((spent / budget.limit) * 100, 100);
  const remaining = budget.limit - spent;
  const isOverBudget = spent > budget.limit;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CategoryIcon
            category={budget.category}
            className="h-5 w-5"
            categoryMap={categoryMap}
          />
          <CardTitle className="text-lg font-medium">
            {budget.category}
          </CardTitle>
        </div>
        <div
          className={cn(
            'text-lg font-semibold',
            isOverBudget && 'text-destructive'
          )}
        >
          {formatCurrency(spent)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress
          value={progress}
          className={cn('h-2', isOverBudget && '[&>div]:bg-destructive')}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{`Limite: ${formatCurrency(budget.limit)}`}</span>
          {isOverBudget ? (
            <span className="font-medium text-destructive">
              {`${formatCurrency(Math.abs(remaining))} au-dessus du budget`}
            </span>
          ) : (
            <span>{`${formatCurrency(remaining)} restant`}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
