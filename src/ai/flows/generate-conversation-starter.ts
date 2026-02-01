'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating conversation starters based on user interests.
 *
 * The flow takes user interests as input and returns a list of suggested conversation starters.
 * - generateConversationStarter - A function that generates conversation starters.
 * - GenerateConversationStarterInput - The input type for the generateConversationStarter function.
 * - GenerateConversationStarterOutput - The return type for the generateConversationStarter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConversationStarterInputSchema = z.object({
  interests: z
    .string()
    .describe('A comma-separated list of the user\'s interests.'),
});
export type GenerateConversationStarterInput = z.infer<
  typeof GenerateConversationStarterInputSchema
>;

const GenerateConversationStarterOutputSchema = z.object({
  conversationStarters: z
    .array(z.string())
    .describe('A list of suggested conversation starters.'),
});
export type GenerateConversationStarterOutput = z.infer<
  typeof GenerateConversationStarterOutputSchema
>;

export async function generateConversationStarter(
  input: GenerateConversationStarterInput
): Promise<GenerateConversationStarterOutput> {
  return generateConversationStarterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConversationStarterPrompt',
  input: {schema: GenerateConversationStarterInputSchema},
  output: {schema: GenerateConversationStarterOutputSchema},
  prompt: `You are a helpful AI assistant that suggests conversation starters based on the user's interests.

  Generate a list of 5 conversation starters based on the following interests: {{{interests}}}.
  Format your output as a JSON array of strings.
  `,
});

const generateConversationStarterFlow = ai.defineFlow(
  {
    name: 'generateConversationStarterFlow',
    inputSchema: GenerateConversationStarterInputSchema,
    outputSchema: GenerateConversationStarterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
