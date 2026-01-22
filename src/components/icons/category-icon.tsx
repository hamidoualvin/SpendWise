'use client';

import {
  HelpCircle,
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  Home,
  Zap,
  HeartPulse,
  MoreHorizontal,
  Gift,
  BookOpen,
  Plane,
  PiggyBank,
  Briefcase,
} from 'lucide-react';
import type { Category, WithId } from '@/lib/types';
import { cn } from '@/lib/utils';
import * as React from 'react';

// Make sure this is kept in sync with add-budget-dialog
export const iconMap = {
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  Home,
  Zap,
  HeartPulse,
  Gift,
  BookOpen,
  Plane,
  PiggyBank,
  Briefcase,
  MoreHorizontal,
  HelpCircle,
};

export type IconName = keyof typeof iconMap;


interface CategoryIconProps {
  categoryId: string;
  categories: WithId<Category>[];
  className?: string;
}

export function CategoryIcon({
  categoryId,
  categories,
  className,
}: CategoryIconProps) {
  const category = categories.find(c => c.id === categoryId);
  const iconName = category?.icon as IconName | undefined;

  const Icon = (iconName && iconMap[iconName]) ? iconMap[iconName] : HelpCircle;
  return <Icon className={cn('h-4 w-4', className)} />;
}

    