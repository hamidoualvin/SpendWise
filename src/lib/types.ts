import type { LucideIcon } from "lucide-react";

export type CategoryName =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Housing'
  | 'Utilities'
  | 'Health'
  | 'Other';

export interface Category {
  name: CategoryName;
  icon: LucideIcon;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: CategoryName;
}

export interface Budget {
  category: CategoryName;
  limit: number;
}
