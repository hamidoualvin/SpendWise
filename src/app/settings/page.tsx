'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'MAD', 'DZD', 'TND', 'XOF'];

const formSchema = z.object({
  displayName: z.string().min(2, 'Le nom doit comporter au moins 2 caractères.'),
  defaultCurrency: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { displayName: '', defaultCurrency: 'USD' },
  });

  // Populate form when user loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || '',
        defaultCurrency: 'USD',
      });
    }
  }, [user, form]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  async function onSubmit(data: FormValues) {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser!, { displayName: data.displayName });
      setDocumentNonBlocking(doc(firestore, 'users', user.uid), {
        displayName: data.displayName,
        defaultCurrency: data.defaultCurrency,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast({ title: 'Profil mis à jour !', description: 'Vos informations ont été enregistrées.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le profil.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="grid gap-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre profil et vos préférences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Modifiez votre nom d&apos;affichage et vos préférences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isUserLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.photoURL ?? undefined} />
                  <AvatarFallback className="text-xl">{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user?.displayName || 'Utilisateur'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="displayName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d&apos;affichage</FormLabel>
                    <FormControl><Input placeholder="Votre nom" {...field} disabled={isUserLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="defaultCurrency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Devise par défaut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="pt-2">
                  <Button type="submit" disabled={isSaving || isUserLoading}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
            <CardDescription>Informations sur votre compte SpendWise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Email :</span> {user?.email}</p>
            <p><span className="font-medium text-foreground">UID :</span> {user?.uid}</p>
            <p><span className="font-medium text-foreground">Méthode :</span> {user?.providerData[0]?.providerId}</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
