'use client';

import * as React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'MAD', 'DZD', 'TND', 'XOF'];

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères.'),
  currency: z.string({ required_error: 'Veuillez sélectionner une devise.' }),
  initialBalance: z.coerce.number({ invalid_type_error: 'Veuillez entrer un montant.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddAccountDialog() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', currency: 'USD' },
  });

  async function onSubmit(data: FormValues) {
    if (!user) return;
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'accounts'), {
      userId: user.uid,
      name: data.name,
      currency: data.currency,
      initialBalanceCents: Math.round(data.initialBalance * 100),
      createdAt: serverTimestamp(),
    });
    toast({ title: 'Compte ajouté !', description: `Le compte "${data.name}" a été créé.` });
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) form.reset(); setOpen(v); }}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Ajouter un compte</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nouveau compte</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du compte</FormLabel>
                <FormControl><Input placeholder="ex: Compte courant" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="initialBalance" render={({ field }) => (
              <FormItem>
                <FormLabel>Solde initial</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">$</span>
                    <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="pl-7" step="0.01" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="currency" render={({ field }) => (
              <FormItem>
                <FormLabel>Devise</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Devise" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
