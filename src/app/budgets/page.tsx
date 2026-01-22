import { AppShell } from '@/components/layout/app-shell';
import { budgets, transactions } from '@/lib/data';
import type { CategoryName, Transaction } from '@/lib/types';
import { BudgetCard } from '@/components/budgets/budget-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function BudgetsPage() {
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
        <Card>
          <CardHeader>
            <CardTitle>Overall Budget Summary</CardTitle>
            <CardDescription>
              A high-level overview of your total budget and spending.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Budget
              </p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Remaining
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
              <BudgetCard key={budget.category} budget={budget} spent={spent} />
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
