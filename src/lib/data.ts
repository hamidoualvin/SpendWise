import type { Transaction, Category, Budget, CategoryName } from '@/lib/types';
import {
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  Home,
  Zap,
  HeartPulse,
  MoreHorizontal,
} from 'lucide-react';

export const categories: Category[] = [
  { name: 'Food', icon: Utensils },
  { name: 'Transportation', icon: Car },
  { name: 'Entertainment', icon: Ticket },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Housing', icon: Home },
  { name: 'Utilities', icon: Zap },
  { name: 'Health', icon: HeartPulse },
  { name: 'Other', icon: MoreHorizontal },
];

export const categoryMap = new Map<CategoryName, Category>(categories.map(c => [c.name, c]));

export const transactions: Transaction[] = [
  {
    id: '1',
    date: new Date(2024, 6, 1),
    description: 'Monthly Salary',
    amount: 5000,
    type: 'income',
    category: 'Other',
  },
  {
    id: '2',
    date: new Date(2024, 6, 2),
    description: 'Grocery Shopping',
    amount: 150.75,
    type: 'expense',
    category: 'Food',
  },
  {
    id: '3',
    date: new Date(2024, 6, 3),
    description: 'Gasoline',
    amount: 45.0,
    type: 'expense',
    category: 'Transportation',
  },
  {
    id: '4',
    date: new Date(2024, 6, 5),
    description: 'Movie Night',
    amount: 35.5,
    type: 'expense',
    category: 'Entertainment',
  },
  {
    id: '5',
    date: new Date(2024, 6, 7),
    description: 'New T-shirt',
    amount: 25.0,
    type: 'expense',
    category: 'Shopping',
  },
  {
    id: '6',
    date: new Date(2024, 6, 10),
    description: 'Rent',
    amount: 1200,
    type: 'expense',
    category: 'Housing',
  },
  {
    id: '7',
    date: new Date(2024, 6, 12),
    description: 'Electricity Bill',
    amount: 75.2,
    type: 'expense',
    category: 'Utilities',
  },
  {
    id: '8',
    date: new Date(2024, 6, 15),
    description: 'Dinner with friends',
    amount: 85.0,
    type: 'expense',
    category: 'Food',
  },
   {
    id: '9',
    date: new Date(2024, 6, 18),
    description: 'Pharmacy',
    amount: 30.0,
    type: 'expense',
    category: 'Health',
  },
  {
    id: '10',
    date: new Date(2024, 6, 20),
    description: 'Freelance Project',
    amount: 750,
    type: 'income',
    category: 'Other',
  },
];

export const budgets: Budget[] = [
  { category: 'Food', limit: 500 },
  { category: 'Transportation', limit: 200 },
  { category: 'Entertainment', limit: 150 },
  { category: 'Shopping', limit: 300 },
  { category: 'Housing', limit: 1200 },
  { category: 'Utilities', limit: 150 },
  { category: 'Health', limit: 100 },
  { category: 'Other', limit: 100 },
];
