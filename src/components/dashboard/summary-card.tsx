import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface SummaryCardProps {
  title: string;
  value?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  isLoading?: boolean;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  isLoading,
}: SummaryCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold tracking-tight">{formatCurrency(value ?? 0)}</div>
        )}
      </CardContent>
    </Card>
  );
}
