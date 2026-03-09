'use client';

import * as React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, where, Timestamp } from 'firebase/firestore';
import type { Category, Account, WithId } from '@/lib/types';
import { addDays, addMonths, addYears } from 'date-fns';

const formSchema = z.object({
  type: z.enum(['expense', 'income']),
  accountId: z.string({ required_error: 'Veuillez sélectionner un compte.' }),
  categoryId: z.string({ required_error: 'Veuillez sélectionner une catégorie.' }),
  amount: z.coerce.number({ invalid_type_error: 'Veuillez entrer un montant.' }).positive('Le montant doit être positif.'),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
});

type FormValues = z.infer<typeof formSchema>;

const frequencyLabels: Record<string, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  yearly: 'Annuel',
};

function getNextRunAt(frequency: 'weekly' | 'monthly' | 'yearly'): Date {
  const now = new Date();
  if (frequency === 'weekly') return addDays(now, 7);
  if (frequency === 'monthly') return addMonths(now, 1);
  return addYears(now, 1);
}

export function AddRecurringDialog() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: 'expense', frequency: 'monthly' },
  });

  const type = form.watch('type');

  const categoriesQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'categories'), where('type', '==', type));
  }, [firestore, isUserLoading, user?.uid, type]);

  const accountsQuery = useMemoFirebase(() => {
    if (isUserLoading || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'accounts'));
  }, [firestore, isUserLoading, user?.uid]);

  const { data: categories } = useCollection<WithId<Category>>(categoriesQuery);
  const { data: accounts } = useCollection<WithId<Account>>(accountsQuery);

  async function onSubmit(data: FormValues) {
    if (!user) return;
    const selectedAccount = accounts?.find(a => a.id === data.accountId);
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'recurringRules'), {
      userId: user.uid,
      type: data.type,
      accountId: data.accountId,
      categoryId: data.categoryId,
      amountCents: Math.round(data.amount * 100),
      currency: selectedAccount?.currency || 'USD',
      frequency: data.frequency,
      nextRunAt: Timestamp.fromDate(getNextRunAt(data.frequency)),
      active: true,
      createdAt: serverTimestamp(),
    });
    toast({ title: 'Règle ajoutée !', description: 'La transaction récurrente a été configurée.' });
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) form.reset(); setOpen(v); }}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Ajouter une règle</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nouvelle transaction récurrente</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl><RadioGroupItem value="expense" /></FormControl>
                      <FormLabel className="font-normal">Dépense</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl><RadioGroupItem value="income" /></FormControl>
                      <FormLabel className="font-normal">Revenu</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">$</span>
                      <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="pl-7" step="0.01" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="frequency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.entries(frequencyLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="accountId" render={({ field }) => (
              <FormItem>
                <FormLabel>Compte</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un compte" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {accounts?.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="pt-2">
              <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
              <Button type="submit">Créer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
