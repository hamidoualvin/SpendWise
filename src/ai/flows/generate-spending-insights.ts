'use server';

/**
 * @fileOverview AI-powered flow to generate visual insights and summaries of spending habits.
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
  insights: z.string().describe('A summary of the user\'s spending habits.'),
  chartDataUri: z
    .string()
    .describe(
      'A data URI containing a visual representation (chart or graph) of the user\'s spending patterns.  Must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Properly escaped single quotes
    ),
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
  prompt: `You are an AI assistant that provides financial insights to users based on their spending data.

  Analyze the provided spending data and generate a summary of the user\'s spending habits, highlighting key trends and areas for improvement.  Also generate chart data that is a visual representation of the data provided.

  Spending Data: {{{spendingData}}}

  Ensure that the chartDataUri field contains an appropriate data URI with base64 encoded data.  For example, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w+D9AwPDw8Lw8BAjDAwMDM2N0w8ODk5MwCBjYGBgZAAAAAElFTkSuQmCC". Do not include newlines.
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
