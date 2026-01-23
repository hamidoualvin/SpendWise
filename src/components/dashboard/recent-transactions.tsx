'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CategoryIcon } from '@/components/icons/category-icon';
import { cn, formatCurrency } from '@/lib/utils';
import { useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Transaction, Category, WithId } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function RecentTransactions() {
  const { user, isUserLoading: isUserLoadingAuth } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (isUserLoadingAuth || !user?.uid) return null;
    return query(
      collection(firestore, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(5)
    );
  }, [firestore, user?.uid, isUserLoadingAuth]);

  const categoriesQuery = useMemoFirebase(() => {
    if (isUserLoadingAuth || !user?.uid) return null;
    return query(collection(firestore, 'categories'), where('userId', '==', user.uid));
  }, [firestore, user?.uid, isUserLoadingAuth]);

  const { data: transactions, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<WithId<Category>>(categoriesQuery);

  const categoryMap = React.useMemo(() => {
    if (!categories) return new Map();
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const getCategoryName = (categoryId: string) => {
    return categoryMap.get(categoryId)?.name || 'N/A';
  }

  const isLoading = isUserLoadingAuth || isLoadingTransactions || isLoadingCategories;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>A list of your most recent income and expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
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
                  <div className="font-medium">{transaction.note || 'N/A'}</div>
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
                  {format(transaction.date.toDate(), 'MMM d, yyyy')}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium',
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amountCents, transaction.currency)}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && transactions?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No transactions yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
