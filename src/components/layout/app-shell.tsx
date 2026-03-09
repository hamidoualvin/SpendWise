'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  Home,
  Briefcase,
  Target,
  PlusCircle,
  Menu,
  LogOut,
  Loader2,
  Wallet,
  Tag,
  RefreshCw,
  Settings,
  User,
} from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { AddTransactionDialog } from '../add-transaction-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const mainNavItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: Briefcase },
  { href: '/budgets', label: 'Budgets', icon: Target },
];

const manageNavItems = [
  { href: '/accounts', label: 'Comptes', icon: Wallet },
  { href: '/categories', label: 'Catégories', icon: Tag },
  { href: '/recurring', label: 'Récurrences', icon: RefreshCw },
];

const allNavItems = [...mainNavItems, ...manageNavItems];

// Pages where the "Add Transaction" button is not relevant
const noAddTransactionPaths = ['/accounts', '/categories', '/settings', '/recurring'];

function AppSidebar() {
  const pathname = usePathname();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  return (
    <>
      <AddTransactionDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <Sidebar collapsible="icon" className="border-sidebar-border">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Gestion</SidebarGroupLabel>
            <SidebarMenu>
              {manageNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button
            variant="default"
            className="w-full justify-center group-data-[collapsible=icon]:hidden"
            onClick={() => setAddDialogOpen(true)}
          >
            <PlusCircle className="mr-2" />
            Nouvelle transaction
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="hidden w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
            onClick={() => setAddDialogOpen(true)}
          >
            <PlusCircle />
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

function AppHeader() {
  const pathname = usePathname();
  const title = allNavItems.find((item) => item.href === pathname)?.label
    || (pathname === '/settings' ? 'Paramètres' : 'Dashboard');
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/sign-in');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const showAddTransaction = !noAddTransactionPaths.includes(pathname);

  return (
    <header className="flex h-16 w-full items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden">
          <Menu />
        </SidebarTrigger>
        <h1 className="font-headline text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {showAddTransaction && (
          <div className="hidden md:block">
            <AddTransactionDialog>
              <Button>
                <PlusCircle className="mr-2" />
                Ajouter
              </Button>
            </AddTransactionDialog>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL ?? undefined} alt="User Avatar" data-ai-hint="person face" />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isUserLoading && !user && !pathname.startsWith('/auth')) {
      router.push('/auth/sign-in');
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading && !pathname.startsWith('/auth')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !pathname.startsWith('/auth')) {
    return null;
  }

  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <AppSidebar />
      <SidebarInset className="flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
