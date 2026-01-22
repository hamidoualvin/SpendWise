import { categoryMap as defaultCategoryMap } from '@/lib/data';
import type { Category, CategoryName } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

interface CategoryIconProps {
  category: CategoryName;
  className?: string;
  categoryMap?: Map<string, Category>;
}

export function CategoryIcon({
  category,
  className,
  categoryMap = defaultCategoryMap,
}: CategoryIconProps) {
  const Icon = categoryMap.get(category)?.icon || HelpCircle;
  return <Icon className={cn('h-4 w-4', className)} />;
}
