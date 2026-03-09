'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Plus,
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  Home,
  Zap,
  HeartPulse,
  MoreHorizontal,
  Gift,
  BookOpen,
  Plane,
  PiggyBank,
  Briefcase,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, addDocumentNonBlocking, useAuth } from '@/firebase';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import type { Category, WithId } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getMonth, getYear } from 'date-fns';

export const iconMap = {
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  Home,
  Zap,
  HeartPulse,
  Gift,
  BookOpen,
  Plane,
  PiggyBank,
  Briefcase,
  MoreHorizontal,
};
export type IconName = keyof typeof iconMap;

const addBudgetFormSchema = z.object({
  name: z.string().min(2, 'Le nom de la catégorie doit comporter au moins 2 caractères.'),
  limit: z.coerce.number().positive('La limite doit être un nombre positif.'),
  icon: z.string({ required_error: 'Veuillez sélectionner une icône.' }),
});

type AddBudgetFormValues = z.infer<typeof addBudgetFormSchema>;

interface AddBudgetDialogProps {
  existingCategories: WithId<Category>[];
}

export function AddBudgetDialog({
  existingCategories,
}: AddBudgetDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const formSchemaWithCheck = addBudgetFormSchema.refine(
    (data) => !existingCategories.some(c => c.name.toLowerCase() === data.name.toLowerCase()),
    {
      message: 'Cette catégorie existe déjà.',
      path: ['name'],
    }
  );

  const form = useForm<AddBudgetFormValues>({
    resolver: zodResolver(formSchemaWithCheck),
    defaultValues: {
      name: '',
      limit: '' as any,
      icon: '',
    },
  });

  async function onSubmit(data: AddBudgetFormValues) {
    if (!user || !firestore) {
        toast({ title: "Erreur", description: "Utilisateur non connecté.", variant: "destructive"});
        return;
    }

    try {
        const categoriesCol = collection(firestore, 'users', user.uid, 'categories');
        const newCategoryRef = await addDoc(categoriesCol, {
            userId: user.uid,
            name: data.name,
            icon: data.icon,
            type: 'expense',
            createdAt: serverTimestamp(),
        });

        const newCategoryId = newCategoryRef.id;
        const currency = auth.currentUser?.photoURL || 'USD'; // A remplacer avec la devise de l'utilisateur
        const limitCents = Math.round(data.limit * 100);
        const currentMonth = `${getYear(new Date())}-${(getMonth(new Date()) + 1).toString().padStart(2, '0')}`;

        const budgetsCol = collection(firestore, 'users', user.uid, 'budgets');
        await addDocumentNonBlocking(budgetsCol, {
            userId: user.uid,
            categoryId: newCategoryId,
            month: currentMonth,
            limitCents: limitCents,
            currency: currency,
            createdAt: serverTimestamp(),
        });

        toast({
            title: 'Catégorie de budget ajoutée !',
            description: `La catégorie "${data.name}" avec une limite de ${formatCurrency(limitCents, currency)} a été ajoutée.`,
        });
        setOpen(false);
        form.reset();

    } catch (e) {
        console.error("Error adding budget: ", e);
        toast({ title: "Erreur", description: "Impossible d'ajouter la catégorie.", variant: "destructive"});
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle catégorie de budget</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la catégorie</FormLabel>
                  <FormControl>
                    <Input placeholder="p. ex. Voyages" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite mensuelle</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        className="pl-7"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icône</FormLabel>
                  <ScrollArea className="h-40 rounded-md border p-4">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-4 gap-4 sm:grid-cols-5"
                      >
                        {Object.keys(iconMap).map((iconName) => {
                          const Icon = iconMap[iconName as IconName];
                          return (
                            <FormItem
                              key={iconName}
                              className="flex items-center justify-center"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={iconName}
                                  className="sr-only"
                                />
                              </FormControl>
                              <FormLabel className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-transparent p-2 hover:bg-accent hover:border-border [&:has([data-state=checked])]:border-primary">
                                <Icon className="h-6 w-6" />
                                <span className="text-xs">{iconName}</span>
                              </FormLabel>
                            </FormItem>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit">Ajouter un budget</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
