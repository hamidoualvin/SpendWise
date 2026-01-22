'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type Budget, type Category, type WithId } from '@/lib/types';
import { CategoryIcon } from '@/components/icons/category-icon';
import { cn, formatCurrency } from '@/lib/utils';

interface BudgetCardProps {
  budget: WithId<Budget>;
  spent: number;
  categoryMap: Map<string, WithId<Category>>;
  categories: WithId<Category>[];
}

export function BudgetCard({ budget, spent, categoryMap, categories }: BudgetCardProps) {
  const progress = Math.min((spent / budget.limitCents) * 100, 100);
  const remaining = budget.limitCents - spent;
  const isOverBudget = spent > budget.limitCents;

  const category = categoryMap.get(budget.categoryId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CategoryIcon
            categoryId={budget.categoryId}
            categories={categories}
            className="h-5 w-5"
          />
          <CardTitle className="text-lg font-medium">
            {category?.name || '...'}
          </CardTitle>
        </div>
        <div
          className={cn(
            'text-lg font-semibold',
            isOverBudget && 'text-destructive'
          )}
        >
          {formatCurrency(spent, budget.currency)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress
          value={progress}
          className={cn('h-2', isOverBudget && '[&>div]:bg-destructive')}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{`Limite: ${formatCurrency(budget.limitCents, budget.currency)}`}</span>
          {isOverBudget ? (
            <span className="font-medium text-destructive">
              {`${formatCurrency(Math.abs(remaining), budget.currency)} au-dessus du budget`}
            </span>
          ) : (
            <span>{`${formatCurrency(remaining, budget.currency)} restant`}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

    