'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';
import { generateSpendingInsights } from '@/ai/flows/generate-spending-insights';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import type { InsightsCache } from '@/lib/types';
import { useDashboardData } from '@/contexts/dashboard-data';
import { format, startOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#F97316', '#EC4899'];

export function AiInsights() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [insightsText, setInsightsText] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { transactions, categories, isLoading: isDashboardLoading } = useDashboardData();

  // Check cache on mount
  React.useEffect(() => {
    if (isUserLoading || !user?.uid) return;
    const period = format(new Date(), 'yyyy-MM');
    const cacheRef = doc(firestore, 'users', user.uid, 'insightsCache', period);
    getDoc(cacheRef).then(snap => {
      if (snap.exists()) {
        const cached = snap.data() as InsightsCache;
        if (cached.ttlExpiresAt.toDate() > new Date()) {
          setInsightsText(cached.summary);
        }
      }
    }).catch(() => {/* silently ignore */});
  }, [user?.uid, isUserLoading, firestore]);

  // Recharts data: expenses by category for current month
  const chartData = React.useMemo(() => {
    if (!transactions || !categories) return [];
    const monthStart = startOfMonth(new Date());
    const spendingMap = new Map<string, number>();
    transactions
      .filter(t => t.type === 'expense' && t.date.toDate() >= monthStart)
      .forEach(t => {
        spendingMap.set(t.categoryId, (spendingMap.get(t.categoryId) ?? 0) + t.amountCents);
      });
    return Array.from(spendingMap.entries())
      .map(([categoryId, amountCents]) => ({
        name: categories.find(c => c.id === categoryId)?.name ?? 'Other',
        value: Math.round(amountCents / 100),
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const handleGenerateInsights = async () => {
    if (!transactions || transactions.length === 0) {
      toast({ title: 'No data', description: 'There are no transactions to analyze.' });
      return;
    }
    setIsGenerating(true);
    try {
      const spendingData = JSON.stringify(
        transactions.map(({ id, userId, accountId, categoryId, createdAt, ...rest }) => ({
          ...rest,
          date: rest.date.toDate().toISOString().split('T')[0],
        }))
      );
      const { insights } = await generateSpendingInsights({ spendingData });
      setInsightsText(insights);

      // Save to cache (TTL = 24 hours)
      if (user?.uid) {
        const period = format(new Date(), 'yyyy-MM');
        const cacheRef = doc(firestore, 'users', user.uid, 'insightsCache', period);
        await setDoc(cacheRef, {
          userId: user.uid,
          period,
          summary: insights,
          bullets: [],
          metrics: {},
          generatedAt: serverTimestamp(),
          ttlExpiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        });
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast({
        title: 'Error Generating Insights',
        description: 'There was a problem connecting to the AI service. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const hasData = !isDashboardLoading && transactions && transactions.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Visual breakdown of your spending with AI-generated analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px]">
        {isDashboardLoading && <Skeleton className="h-[250px] w-full" />}

        {!isDashboardLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recharts PieChart — always shown when there's data */}
            <div>
              <h3 className="font-semibold mb-2">This Month's Expenses</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                  No expenses this month.
                </div>
              )}
            </div>

            {/* AI text insights */}
            <div>
              <h3 className="font-semibold mb-2">AI Summary</h3>
              {isGenerating && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing your spending...</span>
                </div>
              )}
              {!isGenerating && insightsText && (
                <p className="text-sm text-muted-foreground leading-relaxed">{insightsText}</p>
              )}
              {!isGenerating && !insightsText && (
                <p className="text-sm text-muted-foreground">
                  Click "Generate Insights" to get a personalized AI analysis of your spending habits.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateInsights}
          disabled={isGenerating || !hasData}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Insights'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
