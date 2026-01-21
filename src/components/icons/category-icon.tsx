import { categoryMap } from '@/lib/data';
import type { CategoryName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

interface CategoryIconProps {
  category: CategoryName;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = categoryMap.get(category)?.icon || HelpCircle;
  return <Icon className={cn('h-4 w-4', className)} />;
}
