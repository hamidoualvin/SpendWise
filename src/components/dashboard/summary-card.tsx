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
  isLoading?: boolean;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  iconColor,
  isLoading,
}: SummaryCardProps) {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-5 w-5 text-muted-foreground', iconColor)} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-8 w-3/4" />
        ) : (
            <div className="text-2xl font-bold">{formatCurrency(value ?? 0)}</div>
        )}
      </CardContent>
    </Card>
  );
}

    