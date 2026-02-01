'use server';

/**
 * @fileOverview A sentiment analysis AI agent for analyzing conversation sentiment.
 *
 * - analyzeSentimentOfConversation - A function that handles the sentiment analysis process.
 * - AnalyzeSentimentOfConversationInput - The input type for the analyzeSentimentOfConversation function.
 * - AnalyzeSentimentOfConversationOutput - The return type for the analyzeSentimentOfConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentOfConversationInputSchema = z.object({
  conversation: z
    .string()
    .describe('The complete conversation history between the user and the bot.'),
});
export type AnalyzeSentimentOfConversationInput = z.infer<
  typeof AnalyzeSentimentOfConversationInputSchema
>;

const AnalyzeSentimentOfConversationOutputSchema = z.object({
  overallSentiment: z
    .string()
    .describe(
      'The overall sentiment of the conversation, e.g., positive, negative, or neutral.'
    ),
  userSentimentTrend: z
    .string()
    .describe(
      'The trend of the user sentiment throughout the conversation, e.g., improving, declining, or stable.'
    ),
  botSentiment: z
    .string()
    .describe('The sentiment expressed by the bot in the conversation.'),
  suggestions: z
    .string()
    .describe(
      'Suggestions for the user to improve their communication skills based on the sentiment analysis.'
    ),
});
export type AnalyzeSentimentOfConversationOutput = z.infer<
  typeof AnalyzeSentimentOfConversationOutputSchema
>;

export async function analyzeSentimentOfConversation(
  input: AnalyzeSentimentOfConversationInput
): Promise<AnalyzeSentimentOfConversationOutput> {
  return analyzeSentimentOfConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSentimentOfConversationPrompt',
  input: {schema: AnalyzeSentimentOfConversationInputSchema},
  output: {schema: AnalyzeSentimentOfConversationOutputSchema},
  prompt: `You are an AI assistant that analyzes the sentiment of a conversation between a user and a bot.

  Analyze the following conversation and provide an overall sentiment, user sentiment trend, bot sentiment, and suggestions for the user to improve their communication skills.

  Conversation: {{{conversation}}}`,
});

const analyzeSentimentOfConversationFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentOfConversationFlow',
    inputSchema: AnalyzeSentimentOfConversationInputSchema,
    outputSchema: AnalyzeSentimentOfConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
