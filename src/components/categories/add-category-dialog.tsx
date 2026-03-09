'use client';

import * as React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { iconMap, IconName } from '@/components/icons/category-icon';

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères.'),
  type: z.enum(['expense', 'income']),
  icon: z.string({ required_error: 'Veuillez sélectionner une icône.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddCategoryDialog() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', type: 'expense', icon: '' },
  });

  async function onSubmit(data: FormValues) {
    if (!user) return;
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'categories'), {
      userId: user.uid,
      name: data.name,
      type: data.type,
      icon: data.icon,
      createdAt: serverTimestamp(),
    });
    toast({ title: 'Catégorie ajoutée !', description: `"${data.name}" a été créée.` });
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) form.reset(); setOpen(v); }}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Ajouter une catégorie</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nouvelle catégorie</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input placeholder="ex: Alimentation" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
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
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="icon" render={({ field }) => (
              <FormItem>
                <FormLabel>Icône</FormLabel>
                <ScrollArea className="h-40 rounded-md border p-3">
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                      className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                      {(Object.keys(iconMap) as IconName[]).filter(k => k !== 'HelpCircle').map(iconName => {
                        const Icon = iconMap[iconName];
                        return (
                          <FormItem key={iconName} className="flex items-center justify-center">
                            <FormControl><RadioGroupItem value={iconName} className="sr-only" /></FormControl>
                            <FormLabel className="flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 border-transparent p-2 hover:bg-accent [&:has([data-state=checked])]:border-primary">
                              <Icon className="h-5 w-5" />
                              <span className="text-[10px]">{iconName}</span>
                            </FormLabel>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                </ScrollArea>
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
