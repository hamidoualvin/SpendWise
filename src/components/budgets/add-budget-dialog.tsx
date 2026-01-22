'use client';

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
import * as React from 'react';
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
  onAddBudget: (values: AddBudgetFormValues) => void;
  existingCategories: string[];
}

export function AddBudgetDialog({
  onAddBudget,
  existingCategories,
}: AddBudgetDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const formSchemaWithCheck = addBudgetFormSchema.refine(
    (data) => !existingCategories.includes(data.name),
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

  function onSubmit(data: AddBudgetFormValues) {
    onAddBudget(data);
    toast({
      title: 'Catégorie de budget ajoutée !',
      description: `La catégorie "${data.name}" avec une limite de ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.limit)} a été ajoutée.`,
    });
    setOpen(false);
    form.reset();
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
