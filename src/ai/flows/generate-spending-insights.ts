'use server';

/**
 * @fileOverview AI-powered flow to generate spending insights.
 *
 * - generateSpendingInsights - A function that generates spending insights.
 * - GenerateSpendingInsightsInput - The input type for the generateSpendingInsights function.
 * - GenerateSpendingInsightsOutput - The return type for the generateSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpendingInsightsInputSchema = z.object({
  spendingData: z
    .string()
    .describe(
      'A JSON string containing spending data, including categories, amounts, and dates.'
    ),
});
export type GenerateSpendingInsightsInput = z.infer<
  typeof GenerateSpendingInsightsInputSchema
>;

const GenerateSpendingInsightsOutputSchema = z.object({
  insights: z.string().describe('A concise summary of the user\'s spending habits.'),
});
export type GenerateSpendingInsightsOutput = z.infer<
  typeof GenerateSpendingInsightsOutputSchema
>;

export async function generateSpendingInsights(
  input: GenerateSpendingInsightsInput
): Promise<GenerateSpendingInsightsOutput> {
  return generateSpendingInsightsFlow(input);
}

const generateInsightsPrompt = ai.definePrompt({
  name: 'generateInsightsPrompt',
  input: {schema: GenerateSpendingInsightsInputSchema},
  output: {schema: GenerateSpendingInsightsOutputSchema},
  prompt: `You are an AI financial assistant. Analyze the provided spending data and generate a concise 3-5 sentence summary of the user's spending habits, highlighting key trends and areas for improvement.

  Spending Data: {{{spendingData}}}
  `,
});

const generateSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'generateSpendingInsightsFlow',
    inputSchema: GenerateSpendingInsightsInputSchema,
    outputSchema: GenerateSpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await generateInsightsPrompt(input);
    return output!;
  }
);
