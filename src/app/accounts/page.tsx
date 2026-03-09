'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AddAccountDialog } from '@/components/accounts/add-account-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Wallet } from 'lucide-react';
import { useCollection, useUser, useMemoFirebase, useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Account, Transaction, WithId } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AccountsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const accountsQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'accounts'), orderBy('createdAt', 'asc'));
  }, [firestore, isUserLoading, user?.uid]);

  const transactionsQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'transactions'));
  }, [firestore, isUserLoading, user?.uid]);

  const { data: accounts, isLoading: isLoadingAccounts } = useCollection<WithId<Account>>(accountsQuery);
  const { data: transactions, isLoading: isLoadingTx } = useCollection<WithId<Transaction>>(transactionsQuery);

  const isLoading = isUserLoading || isLoadingAccounts || isLoadingTx;

  const getBalance = (accountId: string, initialBalanceCents: number) => {
    if (!transactions) return initialBalanceCents;
    return transactions
      .filter(t => t.accountId === accountId)
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amountCents : -t.amountCents), initialBalanceCents);
  };

  const handleDelete = (accountId: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'accounts', accountId));
  };

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Comptes</h1>
            <p className="text-muted-foreground">Gérez vos comptes bancaires et leur solde.</p>
          </div>
          <AddAccountDialog />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        )}

        {!isLoading && accounts?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">Aucun compte</h3>
            <p className="text-sm text-muted-foreground mt-1">Ajoutez votre premier compte pour commencer.</p>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts?.map(account => {
              const balance = getBalance(account.id, account.initialBalanceCents);
              return (
                <Card key={account.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium">{account.name}</CardTitle>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer ce compte ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Les transactions liées à ce compte ne seront pas supprimées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(account.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${balance < 0 ? 'text-destructive' : ''}`}>
                      {formatCurrency(balance, account.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Solde initial : {formatCurrency(account.initialBalanceCents, account.currency)} · {account.currency}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
