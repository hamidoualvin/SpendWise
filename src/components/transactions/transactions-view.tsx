'use client';

import React from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, subMonths } from 'date-fns';
import { CategoryIcon } from '@/components/icons/category-icon';
import { cn, formatCurrency } from '@/lib/utils';
import { useCollection, useUser, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Transaction, Category, WithId } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export function TransactionsView() {
  const { user, isUserLoading: isUserLoadingAuth } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (isUserLoadingAuth || !user?.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
  }, [firestore, isUserLoadingAuth, user?.uid]);

  const categoriesQuery = useMemoFirebase(() => {
    if (isUserLoadingAuth || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'categories'));
  }, [firestore, isUserLoadingAuth, user?.uid]);

  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<WithId<Transaction>>(transactionsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<WithId<Category>>(categoriesQuery);

  const categoryMap = React.useMemo(() => {
    if (!categories) return new Map();
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const getCategoryName = (categoryId: string) => categoryMap.get(categoryId)?.name || 'N/A';

  const isLoading = isUserLoadingAuth || isLoadingTransactions || isLoadingCategories;

  // Last 6 months — Revenus vs Dépenses
  const monthlyChartData = React.useMemo(() => {
    const months = new Map<string, { month: string; Revenus: number; Dépenses: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const key = format(d, 'yyyy-MM');
      months.set(key, { month: format(d, 'MMM yy'), Revenus: 0, Dépenses: 0 });
    }
    transactions?.forEach(t => {
      const key = format(t.date.toDate(), 'yyyy-MM');
      if (!months.has(key)) return;
      const entry = months.get(key)!;
      if (t.type === 'income') entry.Revenus = Math.round((entry.Revenus + t.amountCents / 100) * 100) / 100;
      else entry.Dépenses = Math.round((entry.Dépenses + t.amountCents / 100) * 100) / 100;
    });
    return Array.from(months.values());
  }, [transactions]);

  return (
    <div className="grid gap-6">
      {/* Monthly bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenus vs Dépenses</CardTitle>
          <CardDescription>Comparaison mensuelle sur les 6 derniers mois.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} width={60} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, '']} />
                <Legend />
                <Bar dataKey="Revenus" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Dépenses" fill="#F44336" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Full transactions table */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les transactions</CardTitle>
          <CardDescription>Historique complet de vos revenus et dépenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && transactions?.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="font-medium">{transaction.note}</div>
                    <div className="block text-sm text-muted-foreground sm:hidden">
                      {getCategoryName(transaction.categoryId)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="flex w-fit items-center gap-2">
                      <CategoryIcon categoryId={transaction.categoryId} categories={categories || []} className="h-3 w-3" />
                      {getCategoryName(transaction.categoryId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(transaction.date.toDate(), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className={cn('text-right font-medium',
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amountCents, transaction.currency)}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && transactions?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Aucune transaction.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
