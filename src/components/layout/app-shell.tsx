'use client';

import * as React from 'react';
import Link from 'next/link';
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  Briefcase,
  Target,
  Settings,
  PlusCircle,
  Menu,
} from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { AddTransactionDialog } from '../add-transaction-dialog';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '#', label: 'Transactions', icon: Briefcase },
  { href: '#', label: 'Budgets', icon: Target },
  { href: '#', label: 'Settings', icon: Settings },
];

function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-sidebar-border"
      defaultOpen={!isMobile}
    >
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AddTransactionDialog>
          <Button
            variant="default"
            className="w-full justify-center group-data-[collapsible=icon]:hidden"
          >
            <PlusCircle className="mr-2" />
            New Transaction
          </Button>
        </AddTransactionDialog>
        <AddTransactionDialog>
          <Button
            size="icon"
            variant="outline"
            className="hidden w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
          >
            <PlusCircle />
          </Button>
        </AddTransactionDialog>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppHeader() {
  return (
    <header className="flex h-16 w-full items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden">
          <Menu />
        </SidebarTrigger>
        <h1 className="font-headline text-lg font-semibold tracking-tight">
          Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <AddTransactionDialog>
            <Button>
              <PlusCircle className="mr-2" />
              Add Transaction
            </Button>
          </AddTransactionDialog>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/1/100/100" alt="User Avatar" data-ai-hint="person face" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  john.doe@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
