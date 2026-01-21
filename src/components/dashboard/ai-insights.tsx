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
import { generateSpendingInsights, GenerateSpendingInsightsOutput } from '@/ai/flows/generate-spending-insights';
import { type Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface AiInsightsProps {
  transactions: Transaction[];
}

export function AiInsights({ transactions }: AiInsightsProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<GenerateSpendingInsightsOutput | null>(null);
  const { toast } = useToast();

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const spendingData = JSON.stringify(
        transactions.map(({ id, date, ...rest }) => ({
          ...rest,
          date: date.toISOString().split('T')[0],
        }))
      );
      const insights = await generateSpendingInsights({ spendingData });
      setResult(insights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast({
        title: 'Error Generating Insights',
        description: 'There was a problem connecting to the AI service. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Let AI analyze your spending and provide you with a visual summary and helpful tips.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px]">
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-muted-foreground">Generating your financial summary...</p>
            </div>
            <Skeleton className="h-[200px] w-full" />
          </div>
        )}
        {result && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Spending Summary</h3>
              <p className="text-sm text-muted-foreground">{result.insights}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Visual Breakdown</h3>
              <img
                src={result.chartDataUri}
                alt="Spending chart"
                className="w-full h-auto rounded-lg border"
              />
            </div>
          </div>
        )}
        {!isLoading && !result && (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
            <h3 className="text-lg font-semibold">Ready for your insights?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Click the button below to generate a report of your spending habits.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateInsights} disabled={isLoading}>
          {isLoading ? (
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
