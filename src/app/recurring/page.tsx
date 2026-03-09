'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AddRecurringDialog } from '@/components/recurring/add-recurring-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Trash2, RefreshCw } from 'lucide-react';
import { useCollection, useUser, useMemoFirebase, useFirestore, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { RecurringRule, Category, Account, WithId } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { CategoryIcon } from '@/components/icons/category-icon';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const frequencyLabels: Record<string, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  yearly: 'Annuel',
};

export default function RecurringPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const rulesQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'recurringRules'), orderBy('createdAt', 'desc'));
  }, [firestore, isUserLoading, user?.uid]);

  const categoriesQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'categories'));
  }, [firestore, isUserLoading, user?.uid]);

  const accountsQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'accounts'));
  }, [firestore, isUserLoading, user?.uid]);

  const { data: rules, isLoading: isLoadingRules } = useCollection<WithId<RecurringRule>>(rulesQuery);
  const { data: categories, isLoading: isLoadingCat } = useCollection<WithId<Category>>(categoriesQuery);
  const { data: accounts, isLoading: isLoadingAcc } = useCollection<WithId<Account>>(accountsQuery);

  const isLoading = isUserLoading || isLoadingRules || isLoadingCat || isLoadingAcc;

  const categoryMap = React.useMemo(() => new Map(categories?.map(c => [c.id, c]) ?? []), [categories]);
  const accountMap = React.useMemo(() => new Map(accounts?.map(a => [a.id, a]) ?? []), [accounts]);

  const handleToggle = (ruleId: string, active: boolean) => {
    if (!user) return;
    updateDocumentNonBlocking(doc(firestore, 'users', user.uid, 'recurringRules', ruleId), { active });
  };

  const handleDelete = (ruleId: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'recurringRules', ruleId));
  };

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Récurrences</h1>
            <p className="text-muted-foreground">Automatisez vos transactions répétitives.</p>
          </div>
          <AddRecurringDialog />
        </div>

        {isLoading && (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        )}

        {!isLoading && rules?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <RefreshCw className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">Aucune règle récurrente</h3>
            <p className="text-sm text-muted-foreground mt-1">Ajoutez des transactions automatiques (loyer, salaire…).</p>
          </div>
        )}

        {!isLoading && (
          <div className="grid gap-3">
            {rules?.map(rule => {
              const category = categoryMap.get(rule.categoryId);
              const account = accountMap.get(rule.accountId);
              return (
                <Card key={rule.id} className={rule.active ? '' : 'opacity-60'}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <CategoryIcon categoryId={rule.categoryId} categories={categories || []} className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">{category?.name || 'Catégorie inconnue'}</CardTitle>
                        <p className="text-xs text-muted-foreground">{account?.name} · {frequencyLabels[rule.frequency]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={rule.type === 'income' ? 'default' : 'destructive'}>
                        {rule.type === 'income' ? '+' : '-'}{formatCurrency(rule.amountCents, rule.currency)}
                      </Badge>
                      <Switch checked={rule.active} onCheckedChange={(v) => handleToggle(rule.id, v)} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette règle ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(rule.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground">
                      Prochain déclenchement : <span className="font-medium text-foreground">{format(rule.nextRunAt.toDate(), 'dd MMM yyyy')}</span>
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
