'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AddCategoryDialog } from '@/components/categories/add-category-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, Trash2 } from 'lucide-react';
import { useCollection, useUser, useMemoFirebase, useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Category, WithId } from '@/lib/types';
import { CategoryIcon } from '@/components/icons/category-icon';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function CategoriesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const categoriesQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'categories'), orderBy('createdAt', 'asc'));
  }, [firestore, isUserLoading, user?.uid]);

  const { data: categories, isLoading } = useCollection<WithId<Category>>(categoriesQuery);

  const expenseCategories = React.useMemo(() => categories?.filter(c => c.type === 'expense') ?? [], [categories]);
  const incomeCategories = React.useMemo(() => categories?.filter(c => c.type === 'income') ?? [], [categories]);

  const handleDelete = (categoryId: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'categories', categoryId));
  };

  const CategoryList = ({ items }: { items: WithId<Category>[] }) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map(cat => (
        <Card key={cat.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <CategoryIcon categoryId={cat.id} categories={items} className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-sm">{cat.name}</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer "{cat.name}" ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Les transactions utilisant cette catégorie ne seront pas supprimées.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Catégories</h1>
            <p className="text-muted-foreground">Gérez vos catégories de dépenses et revenus.</p>
          </div>
          <AddCategoryDialog />
        </div>

        {(isUserLoading || isLoading) && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        )}

        {!isLoading && categories?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <Tag className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">Aucune catégorie</h3>
            <p className="text-sm text-muted-foreground mt-1">Créez votre première catégorie.</p>
          </div>
        )}

        {!isLoading && expenseCategories.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Dépenses</h2>
              <Badge variant="secondary">{expenseCategories.length}</Badge>
            </div>
            <CategoryList items={expenseCategories} />
          </section>
        )}

        {!isLoading && incomeCategories.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Revenus</h2>
              <Badge variant="secondary">{incomeCategories.length}</Badge>
            </div>
            <CategoryList items={incomeCategories} />
          </section>
        )}
      </div>
    </AppShell>
  );
}
