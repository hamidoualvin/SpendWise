import { type Timestamp } from 'firebase/firestore';

export type WithId<T> = T & { id: string };

export type User = {
  displayName: string;
  email: string;
  photoURL?: string;
  defaultCurrency: string;
  createdAt: Timestamp;
};

export type Account = {
  userId: string;
  name: string;
  currency: string;
  initialBalanceCents: number;
  createdAt: Timestamp;
};

export type Category = {
  userId: string;
  name: string;
  type: 'expense' | 'income';
  icon?: string;
  color?: string;
  createdAt: Timestamp;
};

export type Transaction = {
  userId: string;
  accountId: string;
  categoryId: string;
  type: 'expense' | 'income';
  amountCents: number;
  currency: string;
  date: Timestamp;
  note?: string;
  tags?: string[];
  source?: 'manual' | 'import' | 'recurring';
  createdAt: Timestamp;
};

export type Budget = {
  userId: string;
  month: string; // "YYYY-MM"
  categoryId: string;
  limitCents: number;
  currency: string;
  createdAt: Timestamp;
};

export type RecurringRule = {
  userId: string;
  type: 'expense' | 'income';
  accountId: string;
  categoryId: string;
  amountCents: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number;
  dayOfWeek?: number;
  nextRunAt: Timestamp;
  active: boolean;
  createdAt: Timestamp;
};

export type InsightsCache = {
  userId: string;
  period: string;
  summary: string;
  bullets: string[];
  metrics: Record<string, any>;
  generatedAt: Timestamp;
  ttlExpiresAt: Timestamp;
};

    