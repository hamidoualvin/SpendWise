import { AppShell } from '@/components/layout/app-shell';
import { transactions } from '@/lib/data';
import { TransactionsView } from '@/components/transactions/transactions-view';

export default function TransactionsPage() {
  return (
    <AppShell>
      <TransactionsView transactions={transactions} />
    </AppShell>
  );
}
